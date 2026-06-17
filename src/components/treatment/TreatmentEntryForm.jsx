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

// eslint-disable-next-line react-refresh/only-export-components
export function emptyEntry() {
  return { date: todayStr(), time: nowStr(), notes: '', mainComplaint: '', secondaryComplaint: '', selectedPoints: '', files: [] }
}

export default function TreatmentEntryForm({ data, onChange, isInfo = false }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
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
    setUploadError(null)
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
    } catch (err) {
      setUploadError(err.message ?? 'שגיאה בהעלאת הקובץ')
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
      {!isInfo && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input label="תלונה ראשית" placeholder="כאב ראש, בעיות שינה..." {...field('mainComplaint')} />
            <Input label="תלונה משנית" placeholder="כאבי גב, עייפות..." {...field('secondaryComplaint')} />
          </div>
          <Input label="נקודות טיפול שנבחרו" placeholder="LI4, ST36, LV3..." {...field('selectedPoints')} />
        </>
      )}
      <Textarea label="הערות טיפול" rows={5} placeholder="תיאור הטיפול, נקודות, תגובות..." {...field('notes')} />
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1.5">צרף קבצים</p>
        <FileUploader onFiles={handleFiles} />
        {uploading && <p className="text-xs text-slate-400 mt-1">מעלה...</p>}
        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
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
