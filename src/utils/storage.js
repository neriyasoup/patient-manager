import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { storage, db } from '../firebase'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'))
    reader.readAsDataURL(file)
  })
}

async function compressImageIfNeeded(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return fileToDataUrl(file)
  }
  const originalDataUrl = await fileToDataUrl(file)
  if (file.size <= 250 * 1024) {
    return originalDataUrl
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const maxDim = 1600
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.82)
        resolve(compressed.length < originalDataUrl.length ? compressed : originalDataUrl)
      } catch {
        resolve(originalDataUrl)
      }
    }
    img.onerror = () => resolve(originalDataUrl)
    img.src = originalDataUrl
  })
}

async function tryFirebaseStorageUpload(storagePath, file) {
  const storageRef = ref(storage, storagePath)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('STORAGE_TIMEOUT')), 3500)
  )
  await Promise.race([uploadBytes(storageRef, file), timeoutPromise])
  return await getDownloadURL(storageRef)
}

export async function uploadFile(basePath, file) {
  const fileId = uuidv4()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${basePath}/${fileId}_${safeName}`

  try {
    const url = await tryFirebaseStorageUpload(storagePath, file)
    return {
      id: fileId,
      name: file.name,
      url,
      storagePath,
      uploadedAt: new Date().toISOString(),
    }
  } catch {
    // Fallback to inline compressed dataUrl or Firestore chunked storage
    const dataUrl = await compressImageIfNeeded(file)
    const CHUNK_SIZE = 600 * 1024 // ~600KB per Firestore doc

    if (dataUrl.length <= CHUNK_SIZE) {
      return {
        id: fileId,
        name: file.name,
        url: dataUrl,
        storagePath: 'inline',
        uploadedAt: new Date().toISOString(),
      }
    }

    // Store larger files in Firestore chunks under users/{uid}/fileChunks
    const parts = basePath.split('/')
    const uid = parts[0] === 'users' && parts[1] ? parts[1] : null
    if (!uid) {
      throw new Error('הקובץ גדול מדי לשמירה מקומית (עד 5MB)')
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('הקובץ גדול מדי (מקסימום 5MB)')
    }

    const totalChunks = Math.ceil(dataUrl.length / CHUNK_SIZE)
    for (let i = 0; i < totalChunks; i++) {
      const chunkData = dataUrl.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      await setDoc(doc(db, `users/${uid}/fileChunks/${fileId}_${i}`), {
        fileId,
        index: i,
        data: chunkData,
      })
    }

    const fsPath = `firestore:users/${uid}/fileChunks/${fileId}:${totalChunks}`
    return {
      id: fileId,
      name: file.name,
      url: fsPath,
      storagePath: fsPath,
      uploadedAt: new Date().toISOString(),
    }
  }
}

export async function resolveFileUrl(url) {
  if (!url) return ''
  if (!url.startsWith('firestore:')) return url
  // Format: firestore:users/{uid}/fileChunks/{fileId}:{totalChunks}
  const withoutPrefix = url.slice('firestore:'.length)
  const [basePath, countStr] = withoutPrefix.split(':')
  const totalChunks = parseInt(countStr, 10) || 1
  const chunks = []
  for (let i = 0; i < totalChunks; i++) {
    const snap = await getDoc(doc(db, `${basePath}_${i}`))
    if (snap.exists()) {
      chunks.push(snap.data().data)
    }
  }
  return chunks.join('')
}

export async function deleteFile(storagePath) {
  if (!storagePath || storagePath === 'inline') return
  if (storagePath.startsWith('firestore:')) {
    try {
      const withoutPrefix = storagePath.slice('firestore:'.length)
      const [basePath, countStr] = withoutPrefix.split(':')
      const totalChunks = parseInt(countStr, 10) || 1
      for (let i = 0; i < totalChunks; i++) {
        await deleteDoc(doc(db, `${basePath}_${i}`))
      }
    } catch (err) {
      console.warn('Error deleting Firestore file chunks:', err)
    }
    return
  }
  try {
    await deleteObject(ref(storage, storagePath))
  } catch (err) {
    if (err.code !== 'storage/object-not-found') {
      console.warn('Storage delete warning:', err)
    }
  }
}
