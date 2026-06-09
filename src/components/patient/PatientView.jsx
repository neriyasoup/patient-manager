import { useState } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import { useUIStore } from '../../store/useUIStore'
import PatientHeader from './PatientHeader'
import TreatmentLog from '../treatment/TreatmentLog'
import TreatmentEntry from '../treatment/TreatmentEntry'
import GeneralFiles from '../files/GeneralFiles'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'
import NewPatientModal from './NewPatientModal'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patientsLoading = usePatientStore(s => s.loading)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const treatments = useTreatmentStore(s => s.treatments)
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

  const hasFirstTreatment = treatments.length > 0
  const firstTreatment = hasFirstTreatment ? treatments[treatments.length - 1] : null

  return (
    <div className="flex flex-row h-full overflow-hidden">
      {/* Right column: First Treatment (Intake/Initial) */}
      {hasFirstTreatment && firstTreatment && (
        <div className="w-80 shrink-0 border-l border-slate-200 bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-4">
          <h3 className="font-bold text-slate-700 text-sm">טיפול 1 (אבחון ראשוני)</h3>
          <TreatmentEntry entry={firstTreatment} index={1} />
        </div>
      )}

      {/* Left Column: Patient details & log */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <PatientHeader patient={patient} />
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-8 bg-white">
          <TreatmentLog patientId={patient.id} hideFirst={hasFirstTreatment} />
          <GeneralFiles patient={patient} />
        </div>
      </div>
    </div>
  )
}
