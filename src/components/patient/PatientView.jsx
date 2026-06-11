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
import { v4 as uuidv4 } from 'uuid'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatHebrewDateShort(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(`${dateStr}T12:00:00`)
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

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

  const [newText, setNewText] = useState('')
  const [newDate, setNewDate] = useState(todayStr)
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingDate, setEditingDate] = useState('')
  const [saving, setSaving] = useState(false)

  const infoList = Array.isArray(patient?.additionalInfo) ? patient.additionalInfo : []

  const sortedInfoList = [...infoList].sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '')
    if (dateComp !== 0) return dateComp
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })

  async function handleAddInfo() {
    if (!patient || !newText.trim()) return
    setSaving(true)
    try {
      const entry = {
        id: uuidv4(),
        date: newDate,
        text: newText.trim(),
        createdAt: new Date().toISOString(),
      }
      const updatedList = [entry, ...infoList]
      await updatePatient(patient.id, { additionalInfo: updatedList })
      setNewText('')
      setNewDate(todayStr())
    } catch (err) {
      console.error('Error adding additional info:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateInfo(id) {
    if (!patient || !editingText.trim()) return
    setSaving(true)
    try {
      const updatedList = infoList.map(item =>
        item.id === id ? { ...item, text: editingText.trim(), date: editingDate } : item
      )
      await updatePatient(patient.id, { additionalInfo: updatedList })
      setEditingId(null)
      setEditingText('')
      setEditingDate('')
    } catch (err) {
      console.error('Error updating additional info:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteInfo(id) {
    if (!patient || !window.confirm('האם למחוק רשומה זו?')) return
    setSaving(true)
    try {
      const updatedList = infoList.filter(item => item.id !== id)
      await updatePatient(patient.id, { additionalInfo: updatedList })
    } catch (err) {
      console.error('Error deleting additional info:', err)
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">מידע נוסף</h3>
            <button
              onClick={() => toggleAdditionalInfo()}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center text-xs focus:outline-none cursor-pointer"
              title="סגור"
            >
              ✕
            </button>
          </div>

          {/* Form to Add New Entry */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-3 shadow-xs">
            <Textarea
              label="הוסיפי הערה חדשה"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
              placeholder="רקע, אלרגיות, עדכונים..."
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-medium text-slate-500 block mb-0.5">תאריך</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
              <Button
                onClick={handleAddInfo}
                disabled={saving || !newText.trim()}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-1 px-3"
              >
                הוסיפי
              </Button>
            </div>
          </div>

          {/* Chronological List of Entries */}
          <div className="flex flex-col gap-3">
            {sortedInfoList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">אין מידע נוסף מתועד</p>
            ) : (
              sortedInfoList.map((item) => {
                const isEditing = editingId === item.id

                return (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2 relative group text-right" dir="rtl">
                    {isEditing ? (
                      // Inline Editing Mode
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2 items-center justify-between">
                          <input
                            type="date"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                          />
                          <div className="flex gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                              className="px-2 py-0.5 text-xs"
                            >
                              ביטול
                            </Button>
                            <Button
                              onClick={() => handleUpdateInfo(item.id)}
                              disabled={saving || !editingText.trim()}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-0.5 text-xs font-semibold"
                            >
                              שמור
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Read Mode
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            {formatHebrewDateShort(item.date)}
                          </span>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingId(item.id)
                                setEditingText(item.text)
                                setEditingDate(item.date || todayStr())
                              }}
                              className="text-[10px] text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                              title="ערוך הערה"
                            >
                              עריכה
                            </button>
                            <button
                              onClick={() => handleDeleteInfo(item.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                              title="מחק הערה"
                            >
                              מחיקה
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {item.text}
                        </p>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
