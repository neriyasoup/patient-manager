import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import { PATIENT_STATUSES } from '../../constants'
import { calcAge } from '../../utils/age'
import PatientStatusBadge from './PatientStatusBadge'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import NewPatientModal from './NewPatientModal'
import ConfirmDialog from '../ui/ConfirmDialog'
import Modal from '../ui/Modal'
import PatientForm from './PatientForm'

export default function PatientsListView() {
  const patients = usePatientStore(s => s.patients)
  const loading = usePatientStore(s => s.loading)
  const deletePatient = usePatientStore(s => s.deletePatient)
  const updatePatient = usePatientStore(s => s.updatePatient)
  const selectPatient = useUIStore(s => s.selectPatient)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [updating, setUpdating] = useState(false)

  const filtered = patients.filter(p => {
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase()
    const searchMatch =
      !query.trim() ||
      fullName.includes(query.toLowerCase()) ||
      (p.phone || '').includes(query) ||
      (p.email || '').toLowerCase().includes(query.toLowerCase())

    const statusMatch = statusFilter === 'all' || p.status === statusFilter
    return searchMatch && statusMatch
  })

  function handleSelect(id) {
    selectPatient(id)
    navigate('/')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePatient(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (err) {
      console.error('Error deleting patient:', err)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSaveEdit() {
    if (!editTarget.firstName?.trim() || !editTarget.lastName?.trim()) return
    setUpdating(true)
    try {
      await updatePatient(editTarget.id, editTarget)
      setEditOpen(false)
      setEditTarget(null)
    } catch (err) {
      console.error('Error updating patient:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">מטופלים</h1>
          <p className="text-sm text-slate-500 mt-0.5">סך הכל: {patients.length} מטופלים במערכת</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="self-start sm:self-auto">
          + מטופל.ת חדש.ה
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 max-w-md">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חפש לפי שם, טלפון, אימייל..."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            הכל
          </button>
          {Object.entries(PATIENT_STATUSES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                statusFilter === key
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 py-12">
          <EmptyState
            icon="👥"
            title="לא נמצאו מטופלים"
            description={
              query.trim() || statusFilter !== 'all'
                ? 'נסה לשנות את סינוני החיפוש'
                : 'עדיין אין מטופלים במערכת. לחץ על הכפתור כדי ליצור את המטופל הראשון.'
            }
            action={
              (!query.trim() && statusFilter === 'all') && (
                <Button onClick={() => setShowNew(true)}>מטופל.ת חדש.ה</Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(p => {
            const age = calcAge(p.dob)
            const initial = (p.firstName || '').charAt(0) || '?'

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 font-bold text-base flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleSelect(p.id)}
                        className="font-bold text-slate-800 hover:text-teal-700 transition-colors text-right cursor-pointer"
                      >
                        {p.firstName} {p.lastName}
                      </button>
                      {p.dob && (
                        <span className="text-xs text-slate-400 text-right mt-0.5">
                          גיל: {age !== null ? age : 'לא ידוע'}
                        </span>
                      )}
                    </div>
                  </div>
                  <PatientStatusBadge patientId={p.id} status={p.status} />
                </div>

                {/* Contact info list */}
                <div className="flex flex-col gap-1.5 text-xs text-slate-500 mt-1">
                  {p.phone && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📞</span>
                      <span className="font-mono">{p.phone}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-400">✉️</span>
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.address && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-400">📍</span>
                      <span className="truncate">{p.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-auto flex gap-2">
                  <Button
                    onClick={() => handleSelect(p.id)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs font-semibold"
                  >
                    📂 כניסה לתיק
                  </Button>
                  <Button
                    onClick={() => {
                      setEditTarget({ ...p })
                      setEditOpen(true)
                    }}
                    variant="secondary"
                    size="sm"
                    className="px-2.5 text-xs font-semibold"
                    title="ערוך מטופל"
                  >
                    ✏️
                  </Button>
                  <Button
                    onClick={() => {
                      setDeleteTarget(p)
                      setDeleteOpen(true)
                    }}
                    variant="danger"
                    size="sm"
                    className="px-2.5 text-xs font-semibold"
                    title="מחק מטופל"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="מחיקת מטופל"
        message={`האם למחוק את ${deleteTarget?.firstName} ${deleteTarget?.lastName}? הפעולה בלתי הפיכה.`}
        loading={deleting}
      />
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditTarget(null); }} title="עריכת פרטי מטופל" maxWidth="max-w-md">
        {editTarget && <PatientForm data={editTarget} onChange={setEditTarget} />}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={() => { setEditOpen(false); setEditTarget(null); }} disabled={updating}>ביטול</Button>
          <Button onClick={handleSaveEdit} disabled={updating}>{updating ? 'שומר...' : 'שמור'}</Button>
        </div>
      </Modal>
    </div>
  )
}
