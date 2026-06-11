import { useMemo, useEffect } from 'react'
import { usePatientStore } from '../../store/usePatientStore'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { searchPatients } from '../../utils/searchIndex'

export default function GlobalSearchResults({ onSelect }) {
  const query = useUIStore(s => s.globalQuery)
  const searchType = useUIStore(s => s.globalSearchType || 'patient')
  const patients = usePatientStore(s => s.patients)
  const allTreatments = useTreatmentStore(s => s.allTreatments)
  const loadAllTreatments = useTreatmentStore(s => s.loadAllTreatments)
  const uid = useAuthStore(s => s.user?.uid)

  useEffect(() => {
    if (searchType !== 'patient' && uid) {
      loadAllTreatments()
    }
  }, [searchType, uid, loadAllTreatments])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    if (searchType === 'patient') {
      return searchPatients(patients, query).slice(0, 8).map(p => ({
        id: p.id,
        title: `${p.firstName} ${p.lastName}`,
        subtitle: p.phone || '',
      }))
    }

    // Search in treatments
    const matchingTreatments = allTreatments.filter(t => {
      const patientId = t.patientId || (t._path ? t._path.split('/')[3] : null)
      if (!patientId) return false
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return false

      if (searchType === 'mainComplaint') {
        return t.mainComplaint && t.mainComplaint.toLowerCase().includes(q)
      }
      if (searchType === 'secondaryComplaint') {
        return t.secondaryComplaint && t.secondaryComplaint.toLowerCase().includes(q)
      }
      if (searchType === 'notes') {
        return !t.isInfo && t.notes && t.notes.toLowerCase().includes(q)
      }
      if (searchType === 'isInfo') {
        return t.isInfo && t.notes && t.notes.toLowerCase().includes(q)
      }
      return false
    })

    return matchingTreatments.slice(0, 8).map(t => {
      const patientId = t.patientId || t._path.split('/')[3]
      const patient = patients.find(p => p.id === patientId)

      let matchLabel = ''
      let matchValue = ''
      if (searchType === 'mainComplaint') {
        matchLabel = 'תלונה ראשית'
        matchValue = t.mainComplaint
      } else if (searchType === 'secondaryComplaint') {
        matchLabel = 'תלונה משנית'
        matchValue = t.secondaryComplaint
      } else if (searchType === 'notes') {
        matchLabel = 'הערה'
        matchValue = t.notes
      } else if (searchType === 'isInfo') {
        matchLabel = 'מידע נוסף'
        matchValue = t.notes
      }

      const dateStr = t.date ? new Date(t.date).toLocaleDateString('he-IL') : ''
      const preview = matchValue.length > 40 ? matchValue.slice(0, 40) + '...' : matchValue

      return {
        id: patient.id,
        title: `${patient.firstName} ${patient.lastName}`,
        subtitle: `${matchLabel}: ${preview}${dateStr ? ` (${dateStr})` : ''}`,
      }
    })
  }, [query, searchType, patients, allTreatments])

  if (!query.trim() || results.length === 0) return null

  return (
    <div className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
      {results.map((r, idx) => (
        <button
          key={`${r.id}-${idx}`}
          onClick={() => onSelect(r.id)}
          className="w-full text-right px-4 py-2.5 hover:bg-teal-50 flex flex-col gap-0.5 border-b border-slate-100 last:border-0"
        >
          <span className="font-medium text-sm text-slate-800">{r.title}</span>
          <span className="text-xs text-slate-500">{r.subtitle}</span>
        </button>
      ))}
    </div>
  )
}
