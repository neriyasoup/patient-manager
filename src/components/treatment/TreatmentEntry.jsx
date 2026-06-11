import { useState } from 'react'
import FileCard from '../files/FileCard'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import TreatmentModal from './TreatmentModal'
import { useTreatmentStore } from '../../store/useTreatmentStore'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return dateStr
}

export default function TreatmentEntry({ entry, index, compact = false }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const deleteTreatment = useTreatmentStore(s => s.deleteTreatment)
  const removeFile = useTreatmentStore(s => s.removeFile)
  const renameFile = useTreatmentStore(s => s.renameFile)

  async function handleDelete() {
    setLoading(true)
    try { await deleteTreatment(entry.id) } finally { setLoading(false) }
    setDeleteOpen(false)
  }

  async function handleDeleteFile(fileMeta) {
    await removeFile(entry.id, fileMeta)
  }

  async function handleRenameFile(fileMeta, newName) {
    await renameFile(entry.id, fileMeta, newName)
  }

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${
      entry.isInfo ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-white'
    }`}>
      <div className={compact ? 'flex flex-col gap-2' : 'flex items-start justify-between gap-2'}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={entry.isInfo ? "font-bold text-indigo-700 text-sm" : "font-bold text-teal-700 text-sm"}>
            {entry.isInfo ? `מידע נוסף ${index}` : `טיפול ${index}`}
          </span>
          <span className="text-slate-300 text-xs">|</span>
          <span className="font-semibold text-slate-600 text-sm">{formatDate(entry.date)}</span>
          {entry.time && <span className="text-slate-500 text-xs">{entry.time}</span>}
        </div>
        <div className={`flex gap-1 ${compact ? 'border-t border-slate-100 pt-2 w-full justify-start' : ''}`}>
          <Button variant="ghost" size="xs" onClick={() => setEditOpen(true)}>עריכה</Button>
          <Button variant="ghost" size="xs" onClick={() => setDeleteOpen(true)} className="text-red-500 hover:bg-red-50">
            מחק
          </Button>
        </div>
      </div>

      {entry.notes && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.notes}</p>
      )}

      {entry.files?.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {entry.files.map(f => (
            <FileCard key={f.id} file={f} onDelete={handleDeleteFile} onRename={handleRenameFile} />
          ))}
        </div>
      )}

      <TreatmentModal open={editOpen} onClose={() => setEditOpen(false)} existing={entry} treatmentNumber={index} isInfo={entry.isInfo} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={entry.isInfo ? "מחיקת מידע נוסף" : "מחיקת טיפול"}
        message={entry.isInfo ? "האם למחוק רשומה זו של מידע נוסף?" : "מחק את רשומת הטיפול הזו?"}
        loading={loading}
      />
    </div>
  )
}
