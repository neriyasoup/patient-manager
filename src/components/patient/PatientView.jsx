import { useState, useEffect } from 'react'
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
import CalendarDashboard from '../calendar/CalendarDashboard'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patientsLoading = usePatientStore(s => s.loading)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const treatments = useTreatmentStore(s => s.treatments)
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

  if (!selectedPatientId) {
    return <CalendarDashboard />
  }

  if (!patient) {
    if (patientsLoading) {
      return <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-sm text-slate-400">טוען...</div>
    }
    return <CalendarDashboard />
  }

  const hasFirstTreatment = treatments.length > 0
  const firstTreatment = hasFirstTreatment ? treatments[treatments.length - 1] : null

  return (
    <div className="flex flex-row h-full overflow-hidden">
      {/* Right column: First Treatment (Intake/Initial) & General Files */}
      <div
        style={{ width: `${sidebarWidth}px` }}
        className={`shrink-0 border-l border-slate-200 bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-6 relative ${
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
        
        {hasFirstTreatment && firstTreatment && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-700 text-sm">טיפול 1 (אבחון ראשוני)</h3>
            <TreatmentEntry entry={firstTreatment} index={1} compact={true} />
            <hr className="border-slate-200/80 my-2" />
          </div>
        )}

        <GeneralFiles patient={patient} />
      </div>

      {/* Left Column: Patient details & log */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <PatientHeader patient={patient} />
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-8 bg-white">
          <TreatmentLog patientId={patient.id} hideFirst={hasFirstTreatment} />
        </div>
      </div>
    </div>
  )
}
