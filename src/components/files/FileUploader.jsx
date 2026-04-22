import { useRef, useState } from 'react'
import clsx from 'clsx'

export default function FileUploader({ onFiles, multiple = true, accept }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files) {
    if (!files?.length) return
    onFiles(Array.from(files))
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
        dragging ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-300 hover:bg-slate-50',
      )}
    >
      <p className="text-xs text-slate-500">גרור קבצים לכאן או <span className="text-teal-600 font-medium">לחץ לבחירה</span></p>
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
