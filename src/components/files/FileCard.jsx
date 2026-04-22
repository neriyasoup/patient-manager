import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

function isImage(name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  return IMAGE_EXTS.includes(ext)
}

export default function FileCard({ file, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try { await onDelete(file) } finally { setLoading(false) }
    setConfirmOpen(false)
  }

  return (
    <div className="group relative rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-teal-300 transition-colors">
      <a href={file.url} target="_blank" rel="noreferrer" className="block">
        {isImage(file.name) ? (
          <img src={file.url} alt={file.name} className="w-full h-20 object-cover" />
        ) : (
          <div className="w-full h-20 flex items-center justify-center bg-slate-50 text-3xl">
            📄
          </div>
        )}
        <div className="px-2 py-1.5">
          <p className="text-xs text-slate-600 truncate" title={file.name}>{file.name}</p>
        </div>
      </a>
      {onDelete && (
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
