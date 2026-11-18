import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import TopBar from '../../../components/layout/TopBar'
import PatientTabs from '../../../components/patient/PatientTabs'
import { useSettingsStore } from '../../store/useSettingsStore'

const tabs = [
  { to: '/billing',          label: 'לוח בקרה', icon: '📊', end: true },
  { to: '/billing/invoices', label: 'חשבוניות', icon: '🧾' },
  { to: '/billing/receipts', label: 'קבלות',    icon: '📄' },
  { to: '/billing/settings', label: 'הגדרות עסק', icon: '⚙️' },
]

export default function BillingLayout() {
  const businessName = useSettingsStore(s => s.businessName)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="no-print"><TopBar /><PatientTabs /></div>
      <div className="no-print bg-white border-b border-slate-200 px-4 flex items-center gap-1 shrink-0">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => clsx(
              'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
              isActive
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span className="ml-1">{t.icon}</span>{t.label}
          </NavLink>
        ))}
        {businessName && <span className="mr-auto text-xs text-slate-400">{businessName}</span>}
      </div>
      <main id="billing-main" className="flex-1 overflow-y-auto bg-gray-50">
        <Suspense fallback={<div className="p-6 text-sm text-slate-400">טוען...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
