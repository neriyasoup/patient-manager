import { useState } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import PatientHeader from './PatientHeader'
import TreatmentLog from '../treatment/TreatmentLog'
import GeneralFiles from '../files/GeneralFiles'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'
import NewPatientModal from './NewPatientModal'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patientsLoading = usePatientStore(s => s.loading)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const [showNew, setShowNew] = useState(false)

  if (!selectedPatientId) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <EmptyState
            icon="🌿"
            title="אין מטופל בחור"
            description="חפש מטופל בשורת החיפוש למעלה או צור מטופל חדש כדי להתחיל"
            action={
              <Button onClick={() => setShowNew(true)} variant="primary">
                + מטופל חדש
              </Button>
            }
          />
        </div>
        <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
      </>
    )
  }

  if (!patient) {
    if (patientsLoading) {
      return <div className="flex items-center justify-center h-full text-sm text-slate-400">טוען...</div>
    }
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <EmptyState
            icon="🌿"
            title="אין מטופל בחור"
            description="חפש מטופל בשורת החיפוש למעלה או צור מטופל חדש כדי להתחיל"
            action={
              <Button onClick={() => setShowNew(true)} variant="primary">
                + מטופל חדש
              </Button>
            }
          />
        </div>
        <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <PatientHeader patient={patient} />
      <div className="p-6 flex flex-col gap-8">
        <TreatmentLog patientId={patient.id} />
        <GeneralFiles patient={patient} />
      </div>
    </div>
  )
}
