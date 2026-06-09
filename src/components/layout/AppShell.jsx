import TopBar from './TopBar'
import PatientView from '../patient/PatientView'

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <PatientView />
        </div>
      </div>
    </div>
  )
}
