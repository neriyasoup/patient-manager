import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import PatientHeader from './PatientHeader'
import TreatmentLog from '../treatment/TreatmentLog'
import GeneralFiles from '../files/GeneralFiles'
import EmptyState from '../ui/EmptyState'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patientsLoading = usePatientStore(s => s.loading)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)

  if (!selectedPatientId) {
    return (
      <EmptyState
        icon="🌿"
        title="בחר מטופל"
        description="בחר מטופל מהרשימה כדי לצפות בתיק"
      />
    )
  }

  if (!patient) {
    if (patientsLoading) {
      return <div className="flex items-center justify-center h-full text-sm text-slate-400">טוען...</div>
    }
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
