import { useState, useEffect } from 'react'
import { useTreatmentStore } from '../../store/useTreatmentStore'
import TreatmentEntry from './TreatmentEntry'
import TreatmentEntryForm, { emptyEntry } from './TreatmentEntryForm'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import GeneralFiles from '../files/GeneralFiles'

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
  const updateTreatment = useTreatmentStore(s => s.updateTreatment)
  const deleteTreatment = useTreatmentStore(s => s.deleteTreatment)

  const [isAdding, setIsAdding] = useState(false)
  const [addingIsInfo, setAddingIsInfo] = useState(false)
  const [addingData, setAddingData] = useState(emptyEntry())
  const [addingError, setAddingError] = useState('')
  const [addingLoading, setAddingLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'



  // Debounced autosave
  useEffect(() => {
    if (!isAdding) return

    const hasData = (
      (addingData.notes && addingData.notes.trim() !== '') ||
      (addingData.mainComplaint && addingData.mainComplaint.trim() !== '') ||
      (addingData.secondaryComplaint && addingData.secondaryComplaint.trim() !== '') ||
      (addingData.selectedPoints && addingData.selectedPoints.trim() !== '') ||
      (addingData.files && addingData.files.length > 0)
    )
    if (!hasData) return

    const delayDebounceFn = setTimeout(async () => {
      try {
        let currentId = addingData.id
        let isNew = false
        if (!currentId) {
          const { v4: uuidv4 } = await import('uuid')
          currentId = uuidv4()
          isNew = true
        }

        const dataToSave = { ...addingData, id: currentId, isInfo: addingIsInfo }
        if (isNew) {
          setAddingData(prev => ({ ...prev, id: currentId }))
          await addTreatment(dataToSave)
        } else {
          await updateTreatment(currentId, dataToSave)
        }
        setSaveStatus('saved')
      } catch (err) {
        console.error('Autosave error:', err)
        setSaveStatus('error')
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [addingData, isAdding, addingIsInfo, addTreatment, updateTreatment])

  function handleStartAdd(isInfo) {
    setAddingData(emptyEntry())
    setAddingIsInfo(isInfo)
    setAddingError('')
    setSaveStatus('idle')
    setIsAdding(true)
  }

  function handleAddingDataChange(newData) {
    setAddingData(newData)
    setSaveStatus('saving')
  }

  async function handleSaveAdding() {
    if (!addingData.date) {
      setAddingError('תאריך הוא שדה חובה')
      return
    }
    setAddingLoading(true)
    setAddingError('')
    try {
      let currentId = addingData.id
      if (!currentId) {
        const { v4: uuidv4 } = await import('uuid')
        currentId = uuidv4()
      }
      const dataToSave = { ...addingData, id: currentId, isInfo: addingIsInfo }
      if (!addingData.id) {
        await addTreatment(dataToSave)
      } else {
        await updateTreatment(currentId, dataToSave)
      }
      setIsAdding(false)
    } catch {
      setAddingError('שגיאה בשמירה, נסה שוב')
    } finally {
      setAddingLoading(false)
    }
  }

  async function handleCancelAdding() {
    if (addingData.id) {
      setAddingLoading(true)
      try {
        await deleteTreatment(addingData.id)
      } catch (err) {
        console.error('Failed to delete draft:', err)
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
            <TreatmentEntryForm data={addingData} onChange={handleAddingDataChange} isInfo={addingIsInfo} />
            {addingError && <p className="text-sm text-red-600">{addingError}</p>}
            <div className="flex gap-2 items-center justify-end pt-2 border-t border-slate-100 w-full">
              {saveStatus !== 'idle' && (
                <span className="ml-auto text-xs text-slate-400 font-medium flex items-center gap-1">
                  {saveStatus === 'saving' && '🔄 שומר אוטומטית...'}
                  {saveStatus === 'saved' && '✨ כל השינויים נשמרו'}
                  {saveStatus === 'error' && '⚠️ שגיאה בשמירה האוטומטית'}
                </span>
              )}
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
                {addingLoading ? 'שומר...' : (addingIsInfo ? 'סיום' : 'סיום')}
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
