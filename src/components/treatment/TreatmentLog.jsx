import { useState } from 'react'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import TreatmentEntry from './TreatmentEntry'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function TreatmentLog({ hideFirst = false }) {
  const treatments = useTreatmentStore(s => s.treatments)
  const loading = useTreatmentStore(s => s.loading)
  const addTreatment = useTreatmentStore(s => s.addTreatment)

  const [isAdding, setIsAdding] = useState(false)
  const [addingIsInfo, setAddingIsInfo] = useState(false)
  const [addingData, setAddingData] = useState(emptyEntry())
  const [addingError, setAddingError] = useState('')
  const [addingLoading, setAddingLoading] = useState(false)

  function handleStartAdd(isInfo) {
    setAddingData(emptyEntry())
    setAddingIsInfo(isInfo)
    setAddingError('')
    setIsAdding(true)
  }

  async function handleSaveAdding() {
    if (!addingData.date) {
      setAddingError('תאריך הוא שדה חובה')
      return
    }
    setAddingLoading(true)
    setAddingError('')
    try {
      await addTreatment({ ...addingData, isInfo: addingIsInfo })
      setIsAdding(false)
    } catch {
      setAddingError('שגיאה בשמירה, נסה שוב')
    } finally {
      setAddingLoading(false)
    }
  }

  const visibleTreatments = hideFirst && treatments.length > 0
    ? treatments.slice(0, treatments.length - 1)
    : treatments

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">יומן טיפולים</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleStartAdd(true)}
          >
            + מידע נוסף
          </Button>
          <Button size="sm" onClick={() => handleStartAdd(false)}>+ הוסיפי טיפול</Button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">טוען...</p>}

      {!loading && isAdding && (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-md mb-2 bg-white ${
          addingIsInfo ? 'border-green-300 bg-green-50/10' : 'border-teal-300 bg-teal-50/10'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className={`font-bold text-sm ${addingIsInfo ? 'text-indigo-700' : 'text-teal-700'}`}>
              {addingIsInfo ? 'הוספת מידע נוסף' : `הוספת טיפול חדש (טיפול ${treatments.filter(x => !x.isInfo).length + 1})`}
            </span>
          </div>
          <TreatmentEntryForm data={addingData} onChange={setAddingData} isInfo={addingIsInfo} />
          {addingError && <p className="text-sm text-red-600">{addingError}</p>}
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(false)}
              disabled={addingLoading}
            >
              ביטול
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAdding}
              disabled={addingLoading}
            >
              {addingLoading ? 'שומר...' : (addingIsInfo ? 'שמור' : 'שמור טיפול')}
            </Button>
          </div>
        </div>
      )}

      {!loading && treatments.length === 0 && !isAdding && (
        <EmptyState title="אין טיפולים עדיין" description="הוסיפי את הטיפול הראשון" />
      )}

      {!loading && treatments.length > 0 && visibleTreatments.length === 0 && (
        <EmptyState title="אין טיפולים נוספים" description="הקליקי על '+ הוסיפי טיפול' כדי לתעד את הטיפול הבא במטופל" />
      )}

      <div className="flex flex-col gap-3">
        {visibleTreatments.map((t) => {
          if (t.isInfo) {
            const infoOnly = treatments.filter(x => x.isInfo)
            const originalIndex = infoOnly.findIndex(orig => orig.id === t.id)
            const index = originalIndex !== -1 ? infoOnly.length - originalIndex : null
            return (
              <TreatmentEntry key={t.id} entry={t} index={index} />
            )
          } else {
            const treatmentsOnly = treatments.filter(x => !x.isInfo)
            const originalIndex = treatmentsOnly.findIndex(orig => orig.id === t.id)
            const index = originalIndex !== -1 ? treatmentsOnly.length - originalIndex : null
            return (
              <TreatmentEntry key={t.id} entry={t} index={index} />
            )
          }
        })}
      </div>
    </div>
  )
}
