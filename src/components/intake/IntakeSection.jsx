import { useState } from 'react'
import clsx from 'clsx'

export default function IntakeSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:bg-slate-100 transition-colors"
      >
        <span>{title}</span>
        <span className={clsx('transition-transform text-slate-400', open ? 'rotate-180' : '')}>▾</span>
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2.5">
          {children}
        </div>
      )}
    </div>
  )
}
