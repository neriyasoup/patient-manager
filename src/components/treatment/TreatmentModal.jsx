import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

export default function TreatmentModal({ open, onClose, existing, treatmentNumber, nextTreatmentNumber, isInfo = false }) {
  const isInfoMode = existing ? !!existing.isInfo : isInfo
  const [data, setData] = useState(() => existing ? { ...existing } : emptyEntry())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const addTreatment = useTreatmentStore(s => s.addTreatment)
  const updateTreatment = useTreatmentStore(s => s.updateTreatment)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'

  function handleDataChange(newData) {
    setData(newData)
    setSaveStatus('saving')
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isDirty = open && (
        data.notes !== (existing?.notes ?? '') ||
        data.mainComplaint !== (existing?.mainComplaint ?? '') ||
        data.secondaryComplaint !== (existing?.secondaryComplaint ?? '') ||
        data.selectedPoints !== (existing?.selectedPoints ?? '') ||
        data.date !== (existing?.date ?? '') ||
        data.time !== (existing?.time ?? '')
      )
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [open, data, existing])

  // Debounced autosave for editing
  useEffect(() => {
    if (!open || !existing) return

    const isDirty = (
      data.notes !== (existing.notes ?? '') ||
      data.mainComplaint !== (existing.mainComplaint ?? '') ||
      data.secondaryComplaint !== (existing.secondaryComplaint ?? '') ||
      data.selectedPoints !== (existing.selectedPoints ?? '') ||
      data.date !== (existing.date ?? '') ||
      data.time !== (existing.time ?? '')
    )
    if (!isDirty) return



    const delayDebounceFn = setTimeout(async () => {
      try {
        await updateTreatment(existing.id, data)
        setSaveStatus('saved')
      } catch (err) {
        console.error('Autosave error:', err)
        setSaveStatus('error')
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [data, open, existing, updateTreatment])

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

  async function handleClose() {
    const isDirty = (
      data.notes !== (existing?.notes ?? '') ||
      data.mainComplaint !== (existing?.mainComplaint ?? '') ||
      data.secondaryComplaint !== (existing?.secondaryComplaint ?? '') ||
      data.selectedPoints !== (existing?.selectedPoints ?? '') ||
      data.date !== (existing?.date ?? '') ||
      data.time !== (existing?.time ?? '')
    )
    if (isDirty) {
      if (!window.confirm('יש לך שינויים שלא נשמרו. האם לבטל את השינויים ולסגור?')) return

      if (existing && saveStatus !== 'idle') {
        setLoading(true)
        try {
          await updateTreatment(existing.id, existing)
        } catch (err) {
          console.error('Failed to revert edits:', err)
        } finally {
          setLoading(false)
        }
      }
    }
    onClose()
  }

  const modalTitle = existing
    ? (isInfoMode ? 'עריכת מידע נוסף' : `עריכת טיפול (טיפול ${treatmentNumber})`)
    : (isInfoMode ? 'הוספת מידע נוסף' : `הוספת טיפול (טיפול ${nextTreatmentNumber})`)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${modalTitle}${patientName ? ` — ${patientName}` : ''}`}
      maxWidth="max-w-lg"
    >
      <TreatmentEntryForm data={data} onChange={handleDataChange} isInfo={isInfoMode} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 items-center justify-end pt-2">
        {saveStatus !== 'idle' && (
          <span className="ml-auto text-xs text-slate-400 font-medium flex items-center gap-1">
            {saveStatus === 'saving' && '🔄 שומר אוטומטית...'}
            {saveStatus === 'saved' && '✨ השינויים נשמרו'}
            {saveStatus === 'error' && '⚠️ שגיאה בשמירה'}
          </span>
        )}
        <Button variant="secondary" onClick={handleClose} disabled={loading}>ביטול</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : 'סיום'}</Button>
      </div>
    </Modal>
  )
}
