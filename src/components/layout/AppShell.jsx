import TopBar from './TopBar'
import PatientList from '../patient/PatientList'
import IntakePanel from '../intake/IntakePanel'
import PatientView from '../patient/PatientView'
import { useUIStore } from '../../store/useUIStore'

export default function AppShell() {
  const intakePanelOpen = useUIStore(s => s.intakePanelOpen)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Right column: patient list (RTL → displayed on right) */}
        <div className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <PatientList />
        </div>

        {/* Middle column: intake questionnaire */}
        {selectedPatientId && (
          <div
            className={`shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden transition-all duration-200 ${
              intakePanelOpen ? 'w-72' : 'w-10'
            }`}
          >
            <IntakePanel />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <PatientView />
        </div>
      </div>
    </div>
  )
}
