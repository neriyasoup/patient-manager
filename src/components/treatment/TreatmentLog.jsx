import { useState } from 'react'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import TreatmentEntry from './TreatmentEntry'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import GeneralFiles from '../files/GeneralFiles'
import { deleteFile } from '../../utils/storage'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return dateStr
}

export default function TreatmentLog({ patient, hideFirst = false }) {
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

  function handleAddingDataChange(newData) {
    setAddingData(newData)
  }

  async function handleSaveAdding() {
    if (!addingData.date) {
      setAddingError('תאריך הוא שדה חובה')
      return
    }
    setAddingLoading(true)
    setAddingError('')
    try {
      const { v4: uuidv4 } = await import('uuid')
      const currentId = addingData.id || uuidv4()
      const dataToSave = { ...addingData, id: currentId, isInfo: addingIsInfo }
      await addTreatment(dataToSave)
      setIsAdding(false)
    } catch {
      setAddingError('שגיאה בשמירה, נסה שוב')
    } finally {
      setAddingLoading(false)
    }
  }

  async function handleCancelAdding() {
    if (addingData.files?.length) {
      setAddingLoading(true)
      try {
        await Promise.all(addingData.files.map(f => deleteFile(f.storagePath)))
      } catch (err) {
        console.error('Failed to cleanup draft files:', err)
      } finally {
        setAddingLoading(false)
      }
    }
    setIsAdding(false)
  }

  const visibleTreatments = hideFirst && treatments.length > 0
    ? treatments.slice(0, treatments.length - 1)
    : treatments

  const treatmentsOnly = treatments.filter(x => !x.isInfo)
  const recentPoints = treatmentsOnly
    .filter(t => t.selectedPoints && t.selectedPoints.trim() !== '')
    .slice(0, 10)

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Right Column: Timeline */}
      <div className="flex-1 flex flex-col gap-3 w-full">
        <div className="flex items-center justify-start gap-2.5">
          <Button
            size="sm"
            onClick={() => handleStartAdd(false)}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold"
          >
            + הוספת טיפול
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStartAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold focus:ring-indigo-500"
          >
            + מידע נוסף
          </Button>
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
            <TreatmentEntryForm
              data={addingData}
              onChange={handleAddingDataChange}
              isInfo={addingIsInfo}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelAdding}
                    disabled={addingLoading}
                  >
                    ביטול
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAdding}
                    disabled={addingLoading}
                  >
                    {addingLoading ? 'שומר...' : 'שמירה'}
                  </Button>
                </>
              }
            />
            {addingError && <p className="text-sm text-red-600">{addingError}</p>}
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

      {/* Left Column: Recent Treatment Points & General Files */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6 mt-0 lg:mt-9">
        {/* 10 Last Points Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-3">
          <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
            📍 10 נקודות טיפול אחרונות
          </h4>
          {recentPoints.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">אין נקודות טיפול מתועדות</p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {recentPoints.map((t) => {
                const originalIndex = treatmentsOnly.findIndex(orig => orig.id === t.id)
                const index = originalIndex !== -1 ? treatmentsOnly.length - originalIndex : null
                return (
                  <div key={t.id} className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs hover:border-teal-200 transition-colors">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                      <span className="text-teal-700">טיפול {index}</span>
                      <span>{formatDate(t.date)}</span>
                    </div>
                    <p className="text-slate-800 font-semibold whitespace-pre-wrap mt-0.5 leading-relaxed">
                      {t.selectedPoints}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* General Files */}
        {patient && <GeneralFiles patient={patient} />}
      </div>
    </div>
  )
}
