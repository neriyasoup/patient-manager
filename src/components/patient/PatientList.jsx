import { useState } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import { PATIENT_STATUSES } from '../../constants'
import NewPatientModal from './NewPatientModal'
import Button from '../ui/Button'

export default function PatientList() {
  const patients = usePatientStore(s => s.patients)
  const loading = usePatientStore(s => s.loading)
  const listQuery = useUIStore(s => s.listQuery)
  const setListQuery = useUIStore(s => s.setListQuery)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const selectPatient = useUIStore(s => s.selectPatient)
  const [showNew, setShowNew] = useState(false)

  const filtered = listQuery.trim()
    ? patients.filter(p => `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase().includes(listQuery.toLowerCase()))
    : patients

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-200 flex flex-col gap-2">
        <Button onClick={() => setShowNew(true)} size="sm" className="w-full">+ מטופל חדש</Button>
        <input
          value={listQuery}
          onChange={e => setListQuery(e.target.value)}
          placeholder="חפש מטופל..."
          className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="text-xs text-slate-400 text-center py-4">טוען...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">אין מטופלים</p>
        )}
        {filtered.map(p => {
          const statusConf = PATIENT_STATUSES[p.status] ?? PATIENT_STATUSES.active
          return (
            <button
              key={p.id}
              onClick={() => selectPatient(p.id)}
              className={`w-full text-right px-3 py-2.5 border-b border-slate-100 hover:bg-teal-50 transition-colors flex flex-col gap-0.5 ${
                selectedPatientId === p.id ? 'bg-teal-50 border-r-2 border-r-teal-500' : ''
              }`}
            >
              <span className="text-sm font-medium text-slate-800 truncate">{p.firstName} {p.lastName}</span>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex rounded-full px-1.5 py-px text-[10px] font-medium ${statusConf.color}`}>
                  {statusConf.label}
                </span>
                {p.phone && <span className="text-xs text-slate-400 truncate">{p.phone}</span>}
              </div>
            </button>
          )
        })}
      </div>

      <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  )
}
