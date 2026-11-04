import { useState } from 'react'
import { Button } from './Button'
import { useAuthStore } from '../../store/useAuthStore'

// Shown when there is no valid Google token for sending through Gmail.
export function GoogleReconnect({ onDone }) {
  const reconnect = useAuthStore(s => s.reconnect)
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    try {
      await reconnect()
      onDone?.()
    } catch {
      // popup closed or blocked; the warning stays visible
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-yellow-50 text-yellow-800 text-sm rounded-lg px-3 py-2 flex items-center justify-between gap-3">
      <span>⚠️ כדי לשלוח מיילים צריך לאשר גישה ל-Gmail.</span>
      <Button size="sm" variant="secondary" onClick={handleClick} disabled={busy}>
        {busy ? 'מתחבר...' : 'התחבר ל-Google'}
      </Button>
    </div>
  )
}
