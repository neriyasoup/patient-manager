import { useRef, useState } from 'react'
import clsx from 'clsx'

export default function FileUploader({ onFiles, multiple = true, accept, compact = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files) {
    if (!files?.length) return
    onFiles(Array.from(files))
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'border border-dashed rounded-lg cursor-pointer transition-colors',
        compact
          ? 'px-3 py-1.5 inline-flex items-center gap-1.5 text-xs'
          : 'border-2 p-4 text-center',
        dragging ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50',
      )}
    >
      {compact ? (
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
          <span>📎</span>
          <span>צרף קבצים / תמונות</span>
        </span>
      ) : (
        <p className="text-xs text-slate-500">גרור קבצים לכאן או <span className="text-teal-600 font-medium">לחץ לבחירה</span></p>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
