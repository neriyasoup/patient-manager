import { useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { sendGmailEmail } from '../../utils/sendGmail'
import { useAuthStore } from '../../store/useAuthStore'
import { GoogleReconnect } from './GoogleReconnect'

export function SendEmailModal({ isOpen, onClose, emailData, pdfBlob, pdfFilename }) {
  const [toEmail, setToEmail] = useState(emailData?.toEmail || '')
  const [status, setStatus]   = useState(null) // null | 'sending' | 'ok' | 'error'
  const [error, setError]     = useState('')
  const accessToken = useAuthStore(s => s.accessToken)
  const [needsAuth, setNeedsAuth] = useState(false)

  const handleSend = async () => {
    if (!toEmail) { setError('נא להזין כתובת אימייל'); return }
    setStatus('sending')
    setError('')
    try {
      await sendGmailEmail({ ...emailData, toEmail, pdfBlob, pdfFilename })
      setStatus('ok')
    } catch (e) {
      setStatus('error')
      if (e.message === 'NO_TOKEN') setNeedsAuth(true)
      setError(
        e.message === 'NO_TOKEN'
          ? 'צריך להתחבר מחדש ל-Google ואז לשלוח שוב.'
          : (e.message || 'שגיאה בשליחת האימייל')
      )
    }
  }

  const handleClose = () => {
    setStatus(null)
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="שליחה באימייל" size="sm">
      {status === 'ok' ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-gray-800 mb-1">האימייל נשלח בהצלחה!</p>
          <p className="text-sm text-gray-500 mb-6">{toEmail}</p>
          <Button onClick={handleClose}>סגור</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(!accessToken || needsAuth) && (
            <GoogleReconnect onDone={() => { setNeedsAuth(false); setStatus(null); setError('') }} />
          )}

          <Input
            label="שלח אל"
            type="email"
            placeholder="email@example.com"
            value={toEmail}
            onChange={e => { setToEmail(e.target.value); setError('') }}
            error={error}
          />

          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium text-gray-700">נושא: </span>
            {emailData?.subject}
          </div>

          {pdfBlob && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              📎 {pdfFilename} יצורף כקובץ PDF
            </div>
          )}

          <p className="text-xs text-gray-400">
            האימייל יישלח מחשבון ה-Gmail שלך ויכלול את כל פרטי המסמך.
          </p>

          <div className="flex justify-start gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>ביטול</Button>
            <Button onClick={handleSend} disabled={status === 'sending' || !accessToken}>
              {status === 'sending' ? 'שולח...' : '📧 שלח'}
            </Button>
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </Modal>
  )
}
