import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../firebase'

export async function uploadFile(basePath, file) {
  const fileId = uuidv4()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${basePath}/${fileId}_${safeName}`
  const storageRef = ref(storage, storagePath)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return {
    id: fileId,
    name: file.name,
    url,
    storagePath,
    uploadedAt: new Date().toISOString(),
  }
}

export async function deleteFile(storagePath) {
  try {
    await deleteObject(ref(storage, storagePath))
  } catch (err) {
    if (err.code !== 'storage/object-not-found') throw err
  }
}
