import { useState, useEffect } from 'react'
import { calcAge } from '../../utils/age'
import PatientStatusBadge from './PatientStatusBadge'
import Modal from '../ui/Modal'
import PatientForm from './PatientForm'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return dateStr
}

export default function PatientHeader({ patient }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [loading, setLoading] = useState(false)
  const updatePatient = usePatientStore(s => s.updatePatient)
  const deletePatient = usePatientStore(s => s.deletePatient)
  const selectPatient = useUIStore(s => s.selectPatient)

  const [localNotes, setLocalNotes] = useState(patient.permanentNotes ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalNotes(patient.permanentNotes ?? '')
  }, [patient.id, patient.permanentNotes])

  async function handleSaveNotes() {
    if (localNotes === (patient.permanentNotes ?? '')) return
    setSaving(true)
    try {
      await updatePatient(patient.id, { permanentNotes: localNotes })
    } catch (err) {
      console.error('Error saving permanent notes:', err)
    } finally {
      setSaving(false)
    }
  }

  function openEdit() {
    setEditData({ ...patient })
    setEditOpen(true)
  }

  async function handleSave() {
    if (!editData.firstName?.trim() || !editData.lastName?.trim()) return
    setLoading(true)
    try {
      await updatePatient(patient.id, editData)
      setEditOpen(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await deletePatient(patient.id)
      selectPatient(null)
      setDeleteOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const age = calcAge(patient.dob)

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800">
              {patient.firstName} {patient.lastName}
            </h2>
            <PatientStatusBadge patientId={patient.id} status={patient.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500">
            {patient.dob && (
              <span>
                ת.לידה: {formatDate(patient.dob)}{age !== null && ` (גיל ${age})`}
              </span>
            )}
            {patient.phone && <span>📞 {patient.phone}</span>}
            {patient.email && <span>✉️ {patient.email}</span>}
            {patient.address && <span>📍 {patient.address}</span>}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="secondary" size="sm" onClick={openEdit}>עריכה</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="text-red-500 hover:bg-red-50">
            מחק
          </Button>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500">הערות קבועות</span>
          {saving && <span className="text-[10px] text-teal-600 animate-pulse">שומר...</span>}
        </div>
        <textarea
          value={localNotes}
          onChange={e => setLocalNotes(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="רשום כאן הערות קבועות על המטופל (אלרגיות, אבחנה ראשונית, אזהרות...)"
          rows={2}
          className="w-full text-xs text-amber-900 bg-yellow-50 border border-yellow-200 rounded-lg p-2 focus:outline-none focus:bg-yellow-100/50 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-y placeholder:text-yellow-700/50"
        />
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="עריכת פרטי מטופל" maxWidth="max-w-md">
        {editData && <PatientForm data={editData} onChange={setEditData} />}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={loading}>ביטול</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'שומר...' : 'שמור'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="מחיקת מטופל"
        message={`האם למחוק את ${patient.firstName} ${patient.lastName}? הפעולה בלתי הפיכה.`}
        loading={loading}
      />
    </div>
  )
}
