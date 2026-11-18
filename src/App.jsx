import { useEffect, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { usePatientStore } from './store/usePatientStore'
import { useTreatmentStore } from './store/useTreatmentStore'
import { useUIStore } from './store/useUIStore'
import { useCalendarStore } from './store/useCalendarStore'
import LoginPage from './pages/LoginPage'
import ClinicPage from './pages/ClinicPage'
import PatientsPage from './pages/PatientsPage'
import { useInvoiceStore } from './billing/store/useInvoiceStore'
import { useReceiptStore } from './billing/store/useReceiptStore'
import { useSettingsStore } from './billing/store/useSettingsStore'
import BillingLayout from './billing/components/layout/BillingLayout'

// Billing pages load only when opened, so the clinic stays fast
const lazyPage = (load, name) => lazy(() => load().then(m => ({ default: m[name] })))
const BillingDashboard    = lazyPage(() => import('./billing/pages/Dashboard'), 'Dashboard')
const InvoicesPage        = lazyPage(() => import('./billing/pages/InvoicesPage'), 'InvoicesPage')
const InvoiceDetailPage   = lazyPage(() => import('./billing/pages/InvoiceDetailPage'), 'InvoiceDetailPage')
const ReceiptsPage        = lazyPage(() => import('./billing/pages/ReceiptsPage'), 'ReceiptsPage')
const ReceiptDetailPage   = lazyPage(() => import('./billing/pages/ReceiptDetailPage'), 'ReceiptDetailPage')
const BillingSettingsPage = lazyPage(() => import('./billing/pages/SettingsPage'), 'SettingsPage')

function AuthWatcher() {
  const user = useAuthStore(s => s.user)
  const openPatientIds = useUIStore(s => s.openPatientIds)
  const uid = user?.uid

  // Billing stores handle a null uid themselves (they clear their data)
  useEffect(() => {
    useSettingsStore.getState().init(uid ?? null)
    useInvoiceStore.getState().init(uid ?? null)
    useReceiptStore.getState().init(uid ?? null)
  }, [uid])

  useEffect(() => {
    if (uid) {
      usePatientStore.getState().init(uid)
      useCalendarStore.getState().initMatches(uid)
    } else {
      usePatientStore.getState().destroy()
      useCalendarStore.getState().destroyMatches?.()
    }
  }, [uid])

  // One treatments listener per open patient tab
  useEffect(() => {
    useTreatmentStore.getState().sync(uid ?? null, openPatientIds)
  }, [uid, openPatientIds])

  return null
}

export default function App() {
  const loading = useAuthStore(s => s.loading)
  const user = useAuthStore(s => s.user)
  const initAuth = useAuthStore(s => s.init)

  useEffect(() => { initAuth() }, [initAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        טוען...
      </div>
    )
  }

  return (
    <HashRouter>
      <AuthWatcher />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={user ? <ClinicPage /> : <Navigate to="/login" replace />} />
        <Route path="/patients" element={user ? <PatientsPage /> : <Navigate to="/login" replace />} />
        <Route path="/billing" element={user ? <BillingLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<BillingDashboard />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<InvoiceDetailPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="receipts/new" element={<ReceiptDetailPage />} />
          <Route path="receipts/:id" element={<ReceiptDetailPage />} />
          <Route path="settings" element={<BillingSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
