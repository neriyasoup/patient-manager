import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import PatientForm from './PatientForm'
import Button from '../ui/Button'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

const EMPTY = { firstName: '', lastName: '', phone: '', email: '', address: '', dob: '', status: 'active', balance: '' }

export default function NewPatientModal({ open, onClose, initialData }) {
  const [data, setData] = useState(() => ({ ...EMPTY, ...initialData }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const addPatient = usePatientStore(s => s.addPatient)
  const selectPatient = useUIStore(s => s.selectPatient)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({ ...EMPTY, ...initialData })
    }
  }, [open, initialData])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isDirty = open && (
        (data.firstName && data.firstName.trim() !== '') ||
        (data.lastName && data.lastName.trim() !== '') ||
        (data.phone && data.phone.trim() !== '') ||
        (data.email && data.email.trim() !== '') ||
        (data.address && data.address.trim() !== '') ||
        (data.dob && data.dob !== '') ||
        (data.balance && data.balance !== '')
      )
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [open, data])

  async function handleSave() {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError('שם פרטי ושם משפחה הם שדות חובה')
      return
    }
    setLoading(true)
    setError('')
    try {
      const id = await addPatient(data)
      selectPatient(id)
      setData(EMPTY)
      onClose()
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    const isDirty = (
      (data.firstName && data.firstName.trim() !== '') ||
      (data.lastName && data.lastName.trim() !== '') ||
      (data.phone && data.phone.trim() !== '') ||
      (data.email && data.email.trim() !== '') ||
      (data.address && data.address.trim() !== '') ||
      (data.dob && data.dob !== '') ||
      (data.balance && data.balance !== '')
    )
    if (isDirty) {
      if (!window.confirm('יש לך שינויים שלא נשמרו. האם לסגור את הטופס?')) return
    }
    setData(EMPTY)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="מטופל.ת חדש.ה" maxWidth="max-w-md">
      <PatientForm data={data} onChange={setData} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>ביטול</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : 'צור מטופל'}</Button>
      </div>
    </Modal>
  )
}
