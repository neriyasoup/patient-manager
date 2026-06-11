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
import Textarea from '../ui/Textarea'

export default function PatientView() {
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const patientsLoading = usePatientStore(s => s.loading)
  const patient = usePatientStore(s => s.patients.find(p => p.id === selectedPatientId) ?? null)
  const treatments = useTreatmentStore(s => s.treatments)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const updatePatient = usePatientStore(s => s.updatePatient)
  const showAdditionalInfo = useUIStore(s => s.showAdditionalInfo)
  const toggleAdditionalInfo = useUIStore(s => s.toggleAdditionalInfo)

  const [infoText, setInfoText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (patient) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInfoText(patient.additionalInfo ?? '')
      setSaveSuccess(false)
    }
  }, [patient])

  async function handleSaveInfo() {
    if (!patient) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updatePatient(patient.id, { additionalInfo: infoText })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

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
          <TreatmentLog patientId={patient.id} hideFirst={hasFirstTreatment} />
          <GeneralFiles patient={patient} />
        </div>
      </div>

      {/* Left Sidebar: Additional Info (collapses smoothly to the left) */}
      <div
        className={`shrink-0 border-r border-slate-200 bg-slate-50/50 overflow-y-auto flex flex-col gap-4 relative transition-all duration-300 ease-in-out ${
          showAdditionalInfo ? 'w-80 opacity-100 p-6' : 'w-0 opacity-0 p-0 border-r-0 overflow-hidden'
        }`}
      >
        <div className="w-[272px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm">מידע נוסף</h3>
            <button
              onClick={() => toggleAdditionalInfo()}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center text-xs focus:outline-none cursor-pointer"
              title="סגור"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            הוסיפי ועדכני מידע כללי, רקע רפואי, אלרגיות או הערות חשובות שאינן קשורות לטיפול ספציפי.
          </p>

          <Textarea
            value={infoText}
            onChange={(e) => setInfoText(e.target.value)}
            rows={10}
            placeholder="הקלידי מידע נוסף כאן..."
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveInfo}
              disabled={saving}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
            >
              {saving ? 'שומר...' : 'שמור'}
            </Button>
            {saveSuccess && (
              <span className="text-xs text-green-600 font-semibold animate-pulse flex items-center gap-1">
                ✓ נשמר בהצלחה
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
