import { useMemo } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import { searchPatients } from '../../utils/searchIndex'

export default function GlobalSearchResults({ onSelect }) {
  const query = useUIStore(s => s.globalQuery)
  const patients = usePatientStore(s => s.patients)
  const results = useMemo(() => searchPatients(patients, query).slice(0, 8), [patients, query])

  if (!query.trim() || results.length === 0) return null

  return (
    <div className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
      {results.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="w-full text-right px-4 py-2.5 hover:bg-teal-50 flex flex-col gap-0.5 border-b border-slate-100 last:border-0"
        >
          <span className="font-medium text-sm text-slate-800">{p.firstName} {p.lastName}</span>
          <span className="text-xs text-slate-500">{p.phone}</span>
        </button>
      ))}
    </div>
  )
}
