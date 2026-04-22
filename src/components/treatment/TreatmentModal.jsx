import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import { useTreatmentStore } from '../../store/useTreatmentStore'

export default function TreatmentModal({ open, onClose, existing }) {
  const [data, setData] = useState(emptyEntry())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const addTreatment = useTreatmentStore(s => s.addTreatment)
  const updateTreatment = useTreatmentStore(s => s.updateTreatment)

  useEffect(() => {
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
        await addTreatment(data)
      }
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'עריכת טיפול' : 'הוספת טיפול'}
      maxWidth="max-w-lg"
    >
      <TreatmentEntryForm data={data} onChange={setData} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>ביטול</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : 'שמור טיפול'}</Button>
      </div>
    </Modal>
  )
}
