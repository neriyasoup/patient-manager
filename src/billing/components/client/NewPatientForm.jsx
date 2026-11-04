import { useState } from 'react'
import PatientForm from '../../../components/patient/PatientForm'
import { Button } from '../ui/Button'
import { usePatientStore } from '../../../store/usePatientStore'

// Creates a clinic patient from inside an invoice/receipt form.
export function NewPatientForm({ onSaved, onCancel }) {
  const addPatient = usePatientStore(s => s.addPatient)
  const [data, setData] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '', status: 'active' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError('שם פרטי ושם משפחה הם שדות חובה')
      return
    }
    setSaving(true)
    setError('')
    try {
      const id = await addPatient(data)
      onSaved({ id })
    } catch {
      setError('שגיאה בשמירה, נסה שוב')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PatientForm data={data} onChange={setData} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-start gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>ביטול</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'שומר...' : 'צור מטופל'}</Button>
      </div>
    </div>
  )
}
