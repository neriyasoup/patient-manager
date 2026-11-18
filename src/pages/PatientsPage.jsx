import TopBar from '../components/layout/TopBar'
import PatientTabs from '../components/patient/PatientTabs'
import PatientsListView from '../components/patient/PatientsListView'

export default function PatientsPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <PatientTabs />
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
        <PatientsListView />
      </div>
    </div>
  )
}
