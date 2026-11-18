import { useState, useEffect } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { usePatientTreatments } from '../../store/useTreatmentStore'
import { useUIStore } from '../../store/useUIStore'
import PatientHeader from './PatientHeader'
import PatientTabs from './PatientTabs'
import { PatientContext } from './PatientContext'
import TreatmentLog from '../treatment/TreatmentLog'
import TreatmentEntry from '../treatment/TreatmentEntry'
import CalendarDashboard from '../calendar/CalendarDashboard'

// One open patient file. Every open tab stays mounted (hidden when not active),
// so half-written treatments survive switching between patients.
function PatientPane({ patientId, active }) {
  const patient = usePatientStore(s => s.patients.find(p => p.id === patientId) ?? null)
  const { treatments } = usePatientTreatments(patientId)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      // In RTL, dragging left (decreasing clientX) increases sidebar width
      const newWidth = window.innerWidth - e.clientX
      const minWidth = 220
      const maxWidth = Math.min(600, window.innerWidth * 0.5)
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!patient) return null

  const hasFirstTreatment = treatments.length > 0
  const firstTreatment = hasFirstTreatment ? treatments[treatments.length - 1] : null

  return (
    <PatientContext.Provider value={patientId}>
      <div className={active ? 'flex flex-row flex-1 min-h-0 overflow-hidden' : 'hidden'}>
        {/* Right column: First Treatment (Intake/Initial) */}
        {hasFirstTreatment && firstTreatment && (
          <div
            style={{ width: `${sidebarWidth}px` }}
            className={`shrink-0 border-l border-slate-200 bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-4 relative ${
              isResizing ? 'select-none' : ''
            }`}
          >
            {/* Resize handle draggable area */}
            <div
              onMouseDown={startResizing}
              className={`absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize select-none transition-colors z-30 ${
                isResizing ? 'bg-teal-500' : 'bg-transparent hover:bg-slate-300'
              }`}
            />
            <h3 className="font-bold text-slate-700 text-sm">טיפול 1 (אבחון ראשוני)</h3>
            <TreatmentEntry entry={firstTreatment} index={1} compact={true} />
          </div>
        )}

        {/* Left Column: Patient details & log */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <PatientHeader patient={patient} />
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-8 bg-white">
            <TreatmentLog patient={patient} hideFirst={hasFirstTreatment} />
          </div>
        </div>
      </div>
    </PatientContext.Provider>
  )
}

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const openPatientIds = useUIStore(s => s.openPatientIds)
  const patients = usePatientStore(s => s.patients)
  const patientsLoading = usePatientStore(s => s.loading)

  // Drop tabs of patients that no longer exist (deleted, or another account)
  useEffect(() => {
    if (patientsLoading) return
    const ids = new Set(patients.map(p => p.id))
    const { openPatientIds: open, closePatient } = useUIStore.getState()
    open.filter(id => !ids.has(id)).forEach(closePatient)
  }, [patients, patientsLoading, openPatientIds])

  const activeOpen = selectedPatientId && openPatientIds.includes(selectedPatientId)
  const showCalendar = !activeOpen || (!patientsLoading && !patients.some(p => p.id === selectedPatientId))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PatientTabs />
      {patientsLoading && activeOpen ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">טוען...</div>
      ) : (
        <>
          {showCalendar && <CalendarDashboard />}
          {openPatientIds.map(id => (
            <PatientPane key={id} patientId={id} active={id === selectedPatientId} />
          ))}
        </>
      )}
    </div>
  )
}
