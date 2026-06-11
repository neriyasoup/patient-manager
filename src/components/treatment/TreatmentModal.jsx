import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

export default function TreatmentModal({ open, onClose, existing, treatmentNumber, nextTreatmentNumber, isInfo = false }) {
  const isInfoMode = existing ? !!existing.isInfo : isInfo
  const [data, setData] = useState(emptyEntry())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const addTreatment = useTreatmentStore(s => s.addTreatment)
  const updateTreatment = useTreatmentStore(s => s.updateTreatment)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setData(existing ? { ...existing } : emptyEntry())
    setError('')
  }, [open, existing])

  async function handleSave() {
    if (!data.date) { setError('תאריך הוא שדה חובה'); return }
    setLoading(true)
    setError('')
    try {
      if (existing) {
        await updateTreatment(existing.id, data)
      } else {
        await addTreatment({ ...data, isInfo: isInfoMode })
      }
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = existing
    ? (isInfoMode ? 'עריכת מידע נוסף' : `עריכת טיפול (טיפול ${treatmentNumber})`)
    : (isInfoMode ? 'הוספת מידע נוסף' : `הוספת טיפול (טיפול ${nextTreatmentNumber})`)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${modalTitle}${patientName ? ` — ${patientName}` : ''}`}
      maxWidth="max-w-lg"
    >
      <TreatmentEntryForm data={data} onChange={setData} isInfo={isInfoMode} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>ביטול</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : (isInfoMode ? 'שמור' : 'שמור טיפול')}</Button>
      </div>
    </Modal>
  )
}
