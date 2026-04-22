import { useState } from 'react'
import FileUploader from './FileUploader'
import FileCard from './FileCard'
import { uploadFile, deleteFile } from '../../utils/storage'
import { usePatientStore } from '../../store/usePatientStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function GeneralFiles({ patient }) {
  const [uploading, setUploading] = useState(false)
  const addGeneralFile = usePatientStore(s => s.addGeneralFile)
  const removeGeneralFile = usePatientStore(s => s.removeGeneralFile)
  const uid = useAuthStore(s => s.user?.uid)

  async function handleFiles(files) {
    setUploading(true)
    try {
      for (const file of files) {
        const meta = await uploadFile(`users/${uid}/patients/${patient.id}/general`, file)
        await addGeneralFile(patient.id, meta)
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileMeta) {
    await deleteFile(fileMeta.storagePath)
    await removeGeneralFile(patient.id, fileMeta)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-slate-700 text-sm">קבצים כלליים (תוצאות בדיקות, תמונות)</h3>
      <FileUploader onFiles={handleFiles} />
      {uploading && <p className="text-xs text-slate-500">מעלה...</p>}
      {patient.generalFiles?.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {patient.generalFiles.map(f => (
            <FileCard key={f.id} file={f} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
