import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import PatientHeader from './PatientHeader'
import TreatmentLog from '../treatment/TreatmentLog'
import GeneralFiles from '../files/GeneralFiles'
import EmptyState from '../ui/EmptyState'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)

  if (!selectedPatientId || !patient) {
    return (
      <EmptyState
        icon="🌿"
        title="בחר מטופל"
        description="בחר מטופל מהרשימה כדי לצפות בתיק"
      />
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
