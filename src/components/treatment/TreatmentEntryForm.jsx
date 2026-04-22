import { useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import FileUploader from '../files/FileUploader'
import FileCard from '../files/FileCard'
import { uploadFile, deleteFile } from '../../utils/storage'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'

function todayStr() { return new Date().toISOString().slice(0, 10) }
function nowStr() { return new Date().toTimeString().slice(0, 5) }

export function emptyEntry() {
  return { date: todayStr(), time: nowStr(), notes: '', files: [] }
}

export default function TreatmentEntryForm({ data, onChange }) {
  const [uploading, setUploading] = useState(false)
  const uid = useAuthStore(s => s.user?.uid)
  const patientId = useUIStore(s => s.selectedPatientId)

  function field(key) {
    return {
      value: data[key] ?? '',
      onChange: e => onChange({ ...data, [key]: e.target.value }),
    }
  }

  async function handleFiles(files) {
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const meta = await uploadFile(
          `users/${uid}/patients/${patientId}/treatments/pending`,
          file,
        )
        uploaded.push(meta)
      }
      onChange({ ...data, files: [...(data.files ?? []), ...uploaded] })
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteFile(fileMeta) {
    await deleteFile(fileMeta.storagePath)
    onChange({ ...data, files: (data.files ?? []).filter(f => f.id !== fileMeta.id) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="תאריך" type="date" {...field('date')} />
        <Input label="שעה" type="time" {...field('time')} />
      </div>
      <Textarea label="הערות טיפול" rows={5} placeholder="תיאור הטיפול, נקודות, תגובות..." {...field('notes')} />
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1.5">צרף קבצים</p>
        <FileUploader onFiles={handleFiles} />
        {uploading && <p className="text-xs text-slate-400 mt-1">מעלה...</p>}
        {data.files?.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {data.files.map(f => (
              <FileCard key={f.id} file={f} onDelete={handleDeleteFile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
