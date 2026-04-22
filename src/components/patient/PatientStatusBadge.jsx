import { useState, useRef, useEffect } from 'react'
import { PATIENT_STATUSES } from '../../constants'
import { usePatientStore } from '../../store/usePatientStore'

export default function PatientStatusBadge({ patientId, status }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const updatePatient = usePatientStore(s => s.updatePatient)
  const current = PATIENT_STATUSES[status] ?? PATIENT_STATUSES.active

  useEffect(() => {
    function onClickOut(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [open])

  async function handleSelect(key) {
    setOpen(false)
    await updatePatient(patientId, { status: key })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 ${current.color}`}
      >
        {current.label} ▾
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-max overflow-hidden">
          {Object.entries(PATIENT_STATUSES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${key === status ? 'bg-slate-50' : ''}`}
            >
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${val.color}`}>{val.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
