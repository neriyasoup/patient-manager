import { useState } from 'react'
import FileUploader from './FileUploader'
import FileCard from './FileCard'
import { uploadFile, deleteFile } from '../../utils/storage'
import { usePatientStore } from '../../store/usePatientStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function GeneralFiles({ patient }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const addGeneralFile = usePatientStore(s => s.addGeneralFile)
  const removeGeneralFile = usePatientStore(s => s.removeGeneralFile)
  const renameGeneralFile = usePatientStore(s => s.renameGeneralFile)
  const uid = useAuthStore(s => s.user?.uid)

  async function handleFiles(files) {
    setUploading(true)
    setUploadError(null)
    try {
      for (const file of files) {
        const meta = await uploadFile(`users/${uid}/patients/${patient.id}/general`, file)
        await addGeneralFile(patient.id, meta)
      }
    } catch (err) {
      setUploadError(err.message ?? 'שגיאה בהעלאת הקובץ')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileMeta) {
    await deleteFile(fileMeta.storagePath)
    await removeGeneralFile(patient.id, fileMeta)
  }

  async function handleRename(fileMeta, newName) {
    await renameGeneralFile(patient.id, fileMeta, newName)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-slate-700 text-sm">קבצים כלליים (תוצאות בדיקות, תמונות)</h3>
      <FileUploader onFiles={handleFiles} />
      {uploading && <p className="text-xs text-slate-500">מעלה...</p>}
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      {patient.generalFiles?.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {patient.generalFiles.map(f => (
            <FileCard key={f.id} file={f} onDelete={handleDelete} onRename={handleRename} />
          ))}
        </div>
      )}
    </div>
  )
}
