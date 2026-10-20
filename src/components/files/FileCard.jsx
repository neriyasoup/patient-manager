import { useState, useRef, useEffect } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'
import { resolveFileUrl } from '../../utils/storage'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

function isImage(name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  return IMAGE_EXTS.includes(ext)
}

function splitName(name) {
  const lastDot = name.lastIndexOf('.')
  return lastDot > 0
    ? { base: name.slice(0, lastDot), ext: name.slice(lastDot) }
    : { base: name, ext: '' }
}

function dataUrlToBlobUrl(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mime })
  return URL.createObjectURL(blob)
}

export default function FileCard({ file, onDelete, onRename }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [resolvedUrl, setResolvedUrl] = useState(() =>
    file.url?.startsWith('firestore:') ? '' : file.url
  )
  const inputRef = useRef(null)

  useEffect(() => {
    let active = true
    if (file.url?.startsWith('firestore:')) {
      resolveFileUrl(file.url).then(u => {
        if (active) setResolvedUrl(u)
      })
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedUrl(file.url)
    }
    return () => { active = false }
  }, [file.url])

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  async function handleOpenFile(e) {
    if (!resolvedUrl && file.url?.startsWith('firestore:')) {
      e.preventDefault()
      const u = await resolveFileUrl(file.url)
      setResolvedUrl(u)
      if (u.startsWith('data:')) {
        window.open(dataUrlToBlobUrl(u), '_blank', 'noopener,noreferrer')
      } else if (u) {
        window.open(u, '_blank', 'noopener,noreferrer')
      }
      return
    }
    if (resolvedUrl?.startsWith('data:')) {
      e.preventDefault()
      try {
        const blobUrl = dataUrlToBlobUrl(resolvedUrl)
        window.open(blobUrl, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error('Error opening file:', err)
      }
    }
  }

  async function handleDelete() {
    setLoading(true)
    try { await onDelete(file) } finally { setLoading(false) }
    setConfirmOpen(false)
  }

  function startRename() {
    setNewName(splitName(file.name).base)
    setRenaming(true)
  }

  async function commitRename() {
    const trimmed = newName.trim()
    const { ext } = splitName(file.name)
    const fullName = trimmed + ext
    if (trimmed && fullName !== file.name) {
      await onRename(file, fullName)
    }
    setRenaming(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') setRenaming(false)
  }

  return (
    <div className="group relative rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-teal-300 transition-colors">
      <a href={resolvedUrl || '#'} target="_blank" rel="noreferrer" onClick={handleOpenFile} className="block">
        {isImage(file.name) && resolvedUrl ? (
          <img src={resolvedUrl} alt={file.name} className="w-full h-20 object-cover" />
        ) : (
          <div className="w-full h-20 flex items-center justify-center bg-slate-50 text-3xl">
            📄
          </div>
        )}
      </a>

      <div className="px-2 py-1.5">
        {renaming ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center border border-teal-400 rounded overflow-hidden">
              <input
                ref={inputRef}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 text-xs px-1 py-0.5 outline-none"
              />
              {splitName(file.name).ext && (
                <span className="text-xs text-slate-400 pr-1 flex-shrink-0">{splitName(file.name).ext}</span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={commitRename}
                className="flex-1 text-xs bg-teal-500 text-white rounded py-0.5 hover:bg-teal-600"
              >
                ✓
              </button>
              <button
                onClick={() => setRenaming(false)}
                className="flex-1 text-xs bg-slate-200 text-slate-600 rounded py-0.5 hover:bg-slate-300"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <p className="text-xs text-slate-600 truncate flex-1" title={file.name}>{file.name}</p>
            {onRename && (
              <button
                onClick={(e) => { e.preventDefault(); startRename() }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-600 text-xs flex-shrink-0"
                title="שנה שם"
              >
                ✏
              </button>
            )}
          </div>
        )}
      </div>

      {!renaming && onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); setConfirmOpen(true) }}
          className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="מחק קובץ"
        >
          ✕
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="מחיקת קובץ"
        message={`מחק את "${file.name}"?`}
        loading={loading}
      />
    </div>
  )
}
