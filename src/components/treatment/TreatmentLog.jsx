import { useState } from 'react'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import TreatmentEntry from './TreatmentEntry'
import TreatmentModal from './TreatmentModal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function TreatmentLog({ hideFirst = false }) {
  const treatments = useTreatmentStore(s => s.treatments)
  const loading = useTreatmentStore(s => s.loading)
  const [addOpen, setAddOpen] = useState(false)

  const visibleTreatments = hideFirst && treatments.length > 0
    ? treatments.slice(0, treatments.length - 1)
    : treatments

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">יומן טיפולים</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ הוסיפי טיפול</Button>
      </div>

      {loading && <p className="text-sm text-slate-400">טוען...</p>}

      {!loading && treatments.length === 0 && (
        <EmptyState title="אין טיפולים עדיין" description="הוסיפי את הטיפול הראשון" />
      )}

      {!loading && treatments.length > 0 && visibleTreatments.length === 0 && (
        <EmptyState title="אין טיפולים נוספים" description="הקליקי על '+ הוסיפי טיפול' כדי לתעד את הטיפול הבא במטופל" />
      )}

      <div className="flex flex-col gap-3">
        {visibleTreatments.map((t) => {
          // Find original index in treatments array to preserve absolute numbering
          const originalIndex = treatments.findIndex(orig => orig.id === t.id)
          const index = treatments.length - originalIndex
          return (
            <TreatmentEntry key={t.id} entry={t} index={index} />
          )
        })}
      </div>

      <TreatmentModal open={addOpen} onClose={() => setAddOpen(false)} nextTreatmentNumber={treatments.length + 1} />
    </div>
  )
}
