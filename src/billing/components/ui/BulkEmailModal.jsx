import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { sendGmailEmail } from '../../utils/sendGmail'
import { useAuthStore } from '../../store/useAuthStore'
import { GoogleReconnect } from './GoogleReconnect'

export function BulkEmailModal({ isOpen, onClose, jobs }) {
  const accessToken = useAuthStore(s => s.accessToken)
  const [emailOverrides, setEmailOverrides] = useState({})
  const [phase, setPhase] = useState('setup') // setup | sending | done
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState([])

  const getEmail = job => emailOverrides[job.number] ?? job.toEmail

  const handleSend = async () => {
    setPhase('sending')
    setResults([])
    const done = []
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      setCurrent(i + 1)
      const to = getEmail(job)
      if (!to) {
        done.push({ number: job.number, ok: false, error: 'אין כתובת אימייל' })
        setResults([...done])
        continue
      }
      try {
        const pdfBlob = await job.generatePdf()
        await sendGmailEmail({
          toEmail: to,
          toName: job.toName,
          subject: job.subject,
          html: job.html,
          pdfBlob,
          pdfFilename: job.pdfFilename,
        })
        done.push({ number: job.number, ok: true })
      } catch (e) {
        done.push({ number: job.number, ok: false, error: e.message || 'שגיאה' })
      }
      setResults([...done])
    }
    setPhase('done')
  }

  const handleClose = () => {
    setPhase('setup')
    setResults([])
    setCurrent(0)
    setEmailOverrides({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="שליחה באימייל" size="md">
      {phase === 'done' ? (
        <div dir="rtl" className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">תוצאות השליחה:</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {results.map(r => (
              <div
                key={r.number}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  r.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
                }`}
              >
                <span>{r.ok ? '✅' : '❌'} {r.number}</span>
                {!r.ok && <span className="text-xs">{r.error}</span>}
              </div>
            ))}
          </div>
          <div className="pt-3">
            <Button onClick={handleClose}>סגור</Button>
          </div>
        </div>
      ) : phase === 'sending' ? (
        <div dir="rtl" className="py-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            שולח {current} מתוך {jobs.length}...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(current / jobs.length) * 100}%` }}
            />
          </div>
          <div className="space-y-1">
            {results.map(r => (
              <div key={r.number} className="text-sm text-gray-600">
                {r.ok ? '✅' : '❌'} {r.number}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div dir="rtl" className="space-y-4">
          {!accessToken && <GoogleReconnect />}

          <p className="text-sm text-gray-600">נבחרו {jobs.length} מסמכים — ניתן לערוך את כתובות האימייל לפני השליחה:</p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {jobs.map(job => (
              <div key={job.number} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm text-gray-700 w-24 shrink-0 text-right">{job.number}</span>
                <input
                  type="email"
                  dir="ltr"
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="email@example.com"
                  value={getEmail(job)}
                  onChange={e => setEmailOverrides(prev => ({ ...prev, [job.number]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {jobs.some(j => !getEmail(j)) && (
            <p className="text-xs text-orange-600">⚠️ מסמכים ללא כתובת אימייל יידולגו</p>
          )}

          <div className="flex justify-start gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>ביטול</Button>
            <Button
              onClick={handleSend}
              disabled={!accessToken || jobs.every(j => !getEmail(j))}
            >
              📧 שלח הכל ({jobs.length})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
