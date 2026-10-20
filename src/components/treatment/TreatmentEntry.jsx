import { useState } from 'react'
import FileCard from '../files/FileCard'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import TreatmentEntryForm from './TreatmentEntryForm'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const updateTreatment = useTreatmentStore(s => s.updateTreatment)
  const deleteTreatment = useTreatmentStore(s => s.deleteTreatment)
  const removeFile = useTreatmentStore(s => s.removeFile)
  const renameFile = useTreatmentStore(s => s.renameFile)

  function handleStartEdit() {
    setEditData({ ...entry })
    setEditError('')
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setEditData(null)
    setEditError('')
  }

  async function handleSaveEdit() {
    if (!editData?.date) {
      setEditError('תאריך הוא שדה חובה')
      return
    }
    setSaving(true)
    setEditError('')
    try {
      await updateTreatment(entry.id, editData)
      setIsEditing(false)
      setEditData(null)
    } catch {
      setEditError('שגיאה בשמירה, נסה שוב')
    } finally {
      setSaving(false)
    }
  }

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

  if (isEditing && editData) {
    return (
      <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-md bg-white ${
        entry.isInfo ? 'border-green-300 bg-green-50/10' : 'border-teal-300 bg-teal-50/10'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className={`font-bold text-sm ${entry.isInfo ? 'text-indigo-700' : 'text-teal-700'}`}>
            {entry.isInfo ? `עריכת מידע נוסף ${index}` : `עריכת טיפול ${index}`}
          </span>
        </div>
        <TreatmentEntryForm
          data={editData}
          onChange={setEditData}
          isInfo={!!entry.isInfo}
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                ביטול
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'שומר...' : 'שמירה'}
              </Button>
            </>
          }
        />
        {editError && <p className="text-sm text-red-600">{editError}</p>}
      </div>
    )
  }

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${
      entry.isInfo ? 'border-green-300 bg-green-100/40' : 'border-slate-200 bg-white'
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
          <Button variant="ghost" size="xs" onClick={handleStartEdit}>עריכה</Button>
          <Button variant="ghost" size="xs" onClick={() => setDeleteOpen(true)} className="text-red-500 hover:bg-red-50">
            מחק
          </Button>
        </div>
      </div>
      {(!entry.isInfo) && (entry.mainComplaint || entry.secondaryComplaint) && (
        <div className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {entry.mainComplaint && (
              <div className="flex flex-col gap-0.5 text-right">
                <span className="font-bold text-slate-500">תלונה ראשית:</span>
                <span className="text-slate-800 font-semibold">{entry.mainComplaint}</span>
              </div>
            )}
            {entry.secondaryComplaint && (
              <div className="flex flex-col gap-0.5 text-right">
                <span className="font-bold text-slate-500">תלונה משנית:</span>
                <span className="text-slate-800 font-semibold">{entry.secondaryComplaint}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {entry.notes && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.notes}</p>
      )}
      {(!entry.isInfo) && entry.selectedPoints && (
        <div className="flex flex-col gap-0.5 text-right bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
          <span className="font-bold text-slate-500">נקודות טיפול שנבחרו:</span>
          <span className="text-slate-800 font-semibold">{entry.selectedPoints}</span>
        </div>
      )}

      {entry.files?.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {entry.files.map(f => (
            <FileCard key={f.id} file={f} onDelete={handleDeleteFile} onRename={handleRenameFile} />
          ))}
        </div>
      )}

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
