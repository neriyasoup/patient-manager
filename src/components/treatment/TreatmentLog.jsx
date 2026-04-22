import { useState } from 'react'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import TreatmentEntry from './TreatmentEntry'
import TreatmentModal from './TreatmentModal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function TreatmentLog() {
  const treatments = useTreatmentStore(s => s.treatments)
  const loading = useTreatmentStore(s => s.loading)
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">יומן טיפולים</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ הוסף טיפול</Button>
      </div>

      {loading && <p className="text-sm text-slate-400">טוען...</p>}

      {!loading && treatments.length === 0 && (
        <EmptyState title="אין טיפולים עדיין" description="הוסף את הטיפול הראשון" />
      )}

      <div className="flex flex-col gap-3">
        {treatments.map(t => <TreatmentEntry key={t.id} entry={t} />)}
      </div>

      <TreatmentModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
