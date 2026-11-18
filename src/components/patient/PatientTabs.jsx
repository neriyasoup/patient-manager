import { useState } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

// Browser-style tabs: the calendar plus every open patient file
export default function PatientTabs() {
  const openPatientIds = useUIStore(s => s.openPatientIds)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const editingForms = useUIStore(s => s.editingForms)
  const selectPatient = useUIStore(s => s.selectPatient)
  const closePatient = useUIStore(s => s.closePatient)
  const reorderPatientTabs = useUIStore(s => s.reorderPatientTabs)
  const patients = usePatientStore(s => s.patients)
  const [dragId, setDragId] = useState(null)

  if (openPatientIds.length === 0) return null

  const byId = new Map(patients.map(p => [p.id, p]))

  function handleClose(id) {
    const editing = Object.keys(editingForms[id] ?? {}).length > 0
    if (editing) {
      const p = byId.get(id)
      const name = p ? `${p.firstName} ${p.lastName}` : 'המטופל'
      if (!window.confirm(`בתיק של ${name} יש טיפול פתוח לעריכה שלא נשמר. לסגור בכל זאת?`)) return
    }
    closePatient(id)
  }

  const tabBase = 'group flex items-center gap-1.5 h-9 px-3 rounded-t-lg text-sm whitespace-nowrap border border-b-0 transition-colors cursor-pointer select-none'
  const activeCls = 'bg-white text-slate-800 font-semibold border-slate-200 relative -mb-px'
  const idleCls = 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200/70 hover:text-slate-700'

  return (
    <div className="shrink-0 bg-slate-100 border-b border-slate-200 px-2 pt-1.5 flex items-end gap-1 overflow-x-auto" role="tablist">
      <button
        role="tab"
        aria-selected={!selectedPatientId}
        onClick={() => selectPatient(null)}
        className={`${tabBase} ${!selectedPatientId ? activeCls : idleCls}`}
        title="יומן ופגישות"
      >
        📅 יומן
      </button>

      {openPatientIds.map(id => {
        const p = byId.get(id)
        const active = id === selectedPatientId
        const editing = Object.keys(editingForms[id] ?? {}).length > 0
        const name = p ? `${p.firstName} ${p.lastName}` : '...'
        return (
          <div
            key={id}
            role="tab"
            aria-selected={active}
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={e => { if (dragId && dragId !== id) e.preventDefault() }}
            onDrop={e => { e.preventDefault(); if (dragId) reorderPatientTabs(dragId, id); setDragId(null) }}
            onDragEnd={() => setDragId(null)}
            onClick={() => selectPatient(id)}
            onMouseDown={e => { if (e.button === 1) { e.preventDefault(); handleClose(id) } }}
            className={`${tabBase} ${active ? activeCls : idleCls} max-w-[220px] ${dragId === id ? 'opacity-50' : ''}`}
            title={editing ? `${name} — יש טיפול בעריכה` : name}
          >
            {editing && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-label="בעריכה" />}
            <span className="truncate">{name}</span>
            <button
              onClick={e => { e.stopPropagation(); handleClose(id) }}
              className="shrink-0 w-5 h-5 -ml-1 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-300/60 leading-none"
              aria-label={`סגירת התיק של ${name}`}
              title="סגירת הטאב"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
