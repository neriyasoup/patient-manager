import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import { searchPatients } from '../../utils/searchIndex'

// "+" at the end of the tab row: opens a small search box to open another patient tab
function AddPatientTab({ onPick, openIds }) {
  const patients = usePatientStore(s => s.patients)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const results = useMemo(() => searchPatients(patients, query).slice(0, 8), [patients, query])

  function toggle() {
    if (open) { setOpen(false); return }
    const r = buttonRef.current.getBoundingClientRect()
    // RTL: the panel's right edge sits under the button, clamped to the window
    const width = 288
    const right = Math.max(8, Math.min(window.innerWidth - r.right, window.innerWidth - width - 8))
    setPos({ top: r.bottom + 4, right })
    setQuery('')
    setHighlight(0)
    setOpen(true)
  }

  function pick(p) {
    setOpen(false)
    onPick(p.id)
  }

  // Close on outside click or window resize
  useEffect(() => {
    if (!open) return
    const onDown = e => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function onKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => (h + 1) % results.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => (h - 1 + results.length) % results.length) }
    else if (e.key === 'Enter') { e.preventDefault(); pick(results[Math.min(highlight, results.length - 1)]) }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggle}
        className={`shrink-0 self-center w-6 h-6 mb-0.5 mr-1 flex items-center justify-center rounded border text-base leading-none transition-colors ${
          open
            ? 'bg-slate-200 text-slate-800 border-slate-500'
            : 'text-slate-500 border-slate-300 hover:bg-slate-200 hover:text-slate-800 hover:border-slate-500'
        }`}
        aria-label="פתיחת תיק מטופל בטאב חדש"
        aria-expanded={open}
        title="פתיחת תיק מטופל בטאב חדש"
      >
        +
      </button>

      {open && pos && (
        <div
          ref={panelRef}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 w-72 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setHighlight(0) }}
              onKeyDown={onKeyDown}
              placeholder="חיפוש מטופל לפי שם או טלפון..."
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-3 text-xs text-slate-400 text-center">לא נמצאו מטופלים</p>
          )}
          {results.map((p, idx) => (
            <button
              key={p.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => pick(p)}
              onMouseEnter={() => setHighlight(idx)}
              className={`w-full text-right px-4 py-2 flex items-center justify-between gap-2 border-b border-slate-100 last:border-0 ${
                idx === highlight ? 'bg-teal-50' : 'bg-white'
              }`}
            >
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-sm text-slate-800 truncate">{p.firstName} {p.lastName}</span>
                {p.phone && <span className="text-xs text-slate-500">{p.phone}</span>}
              </span>
              {openIds.includes(p.id) && (
                <span className="shrink-0 text-[10px] text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">פתוח</span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// Browser-style tabs: the calendar plus every open patient file.
// Shown on every page (clinic, patients list, billing); on other pages no tab is
// highlighted and clicking one goes back to the clinic page.
export default function PatientTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onClinic = pathname === '/'
  const openPatientIds = useUIStore(s => s.openPatientIds)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const editingForms = useUIStore(s => s.editingForms)
  const selectPatientInStore = useUIStore(s => s.selectPatient)
  const closePatient = useUIStore(s => s.closePatient)
  const reorderPatientTabs = useUIStore(s => s.reorderPatientTabs)
  const patients = usePatientStore(s => s.patients)
  const [dragId, setDragId] = useState(null)

  function selectPatient(id) {
    selectPatientInStore(id)
    if (!onClinic) navigate('/')
  }

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
        aria-selected={onClinic && !selectedPatientId}
        onClick={() => selectPatient(null)}
        className={`${tabBase} ${onClinic && !selectedPatientId ? activeCls : idleCls}`}
        title="יומן ופגישות"
      >
        📅 יומן
      </button>

      {openPatientIds.map(id => {
        const p = byId.get(id)
        const active = onClinic && id === selectedPatientId
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

      <AddPatientTab onPick={selectPatient} openIds={openPatientIds} />
    </div>
  )
}
