import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

function isoToDisplay(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-')
    return `${d}/${m}/${y}`
  }
  return val
}

function displayToIso(display) {
  const m = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, d, mo, y] = m
  const day = parseInt(d, 10)
  const month = parseInt(mo, 10)
  const year = parseInt(y, 10)
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return null
  return `${y}-${mo}-${d}`
}

function DateInput({ label, error, className, value = '', onChange, ...props }) {
  const [text, setText] = useState(() => isoToDisplay(value))
  const pickerRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(isoToDisplay(value))
  }, [value])

  function handleTextChange(e) {
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }

    setText(formatted)

    if (formatted === '') {
      onChange?.({ target: { value: '' } })
    } else if (formatted.length === 10) {
      const iso = displayToIso(formatted)
      if (iso) {
        onChange?.({ target: { value: iso } })
      }
    }
  }

  function handlePickerChange(e) {
    const iso = e.target.value
    setText(isoToDisplay(iso))
    onChange?.({ target: { value: iso } })
  }

  const isoVal = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : (displayToIso(text) || '')

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          placeholder="dd/mm/yyyy"
          value={text}
          onChange={handleTextChange}
          className={clsx(
            'w-full rounded-md border border-slate-300 pr-3 pl-8 py-1.5 text-sm text-slate-800 text-right placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (pickerRef.current?.showPicker) {
              pickerRef.current.showPicker()
            } else {
              pickerRef.current?.focus()
              pickerRef.current?.click()
            }
          }}
          className="absolute left-2 text-slate-400 hover:text-teal-600 text-sm cursor-pointer focus:outline-none"
          title="בחר תאריך"
        >
          📅
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={isoVal}
          onChange={handlePickerChange}
          tabIndex={-1}
          className="sr-only"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function Input({ label, error, className, type, ...props }) {
  if (type === 'date') {
    return <DateInput label={label} error={error} className={className} {...props} />
  }
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <input
        type={type}
        className={clsx(
          'w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
