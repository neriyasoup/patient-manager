import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../ui/Button'

export default function LoginScreen() {
  const login = useAuthStore(s => s.login)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      await login()
    } catch {
      setError('ההתחברות נכשלה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center flex flex-col gap-6">
        <div>
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-slate-800">מרפאת דיקור</h1>
          <p className="text-sm text-slate-500 mt-1">ניהול מטופלים</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <Button onClick={handleLogin} disabled={loading} size="lg" className="w-full">
          {loading ? 'מתחבר...' : '🔑 כניסה עם Google'}
        </Button>
      </div>
    </div>
  )
}
