import { useState } from 'react'
import Modal from '../ui/Modal'
import PatientForm from './PatientForm'
import Button from '../ui/Button'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

const EMPTY = { firstName: '', lastName: '', phone: '', email: '', address: '', dob: '', status: 'active' }

export default function NewPatientModal({ open, onClose }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const addPatient = usePatientStore(s => s.addPatient)
  const selectPatient = useUIStore(s => s.selectPatient)

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
    setData(EMPTY)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="מטופל חדש" maxWidth="max-w-md">
      <PatientForm data={data} onChange={setData} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>ביטול</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : 'צור מטופל'}</Button>
      </div>
    </Modal>
  )
}
