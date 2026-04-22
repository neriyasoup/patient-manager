import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { usePatientStore } from './store/usePatientStore'
import { useTreatmentStore } from './store/useTreatmentStore'
import { useIntakeStore } from './store/useIntakeStore'
import { useUIStore } from './store/useUIStore'
import LoginPage from './pages/LoginPage'
import ClinicPage from './pages/ClinicPage'

function AuthWatcher() {
  const user = useAuthStore(s => s.user)
  const selectedPatientId = useUIStore(s => s.selectedPatientId)
  const uid = user?.uid

  useEffect(() => {
    if (uid) {
      usePatientStore.getState().init(uid)
    } else {
      usePatientStore.getState().destroy()
    }
  }, [uid])

  useEffect(() => {
    if (!uid) return
    useTreatmentStore.getState().init(uid, selectedPatientId)
    useIntakeStore.getState().init(uid, selectedPatientId)
  }, [uid, selectedPatientId])

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
