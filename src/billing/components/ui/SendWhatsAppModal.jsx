import { useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'

function formatPhoneForWhatsApp(phone) {
  const digits = phone.replace(/\D/g, '')
  // Israeli mobile: 05X (10 digits) → 9725X
  if (digits.startsWith('05') && digits.length === 10) return '972' + digits.slice(1)
  // Israeli landline: 0X (9 digits) → 972X
  if (digits.startsWith('0') && digits.length === 9) return '972' + digits.slice(1)
  return digits
}

export function SendWhatsAppModal({ isOpen, onClose, whatsappData, pdfBlob, pdfFilename }) {
  const [phone, setPhone] = useState(whatsappData?.phone || '')
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'
  const [error, setError] = useState('')
  const [usedShareApi, setUsedShareApi] = useState(false)

  const handleSend = async () => {
    if (!phone.trim()) { setError('נא להזין מספר טלפון'); return }
    setStatus('sending')
    setError('')

    const formattedPhone = formatPhoneForWhatsApp(phone)
    const message = whatsappData?.message || ''

    try {
      // On mobile: try Web Share API so the PDF can be shared directly into WhatsApp
      if (pdfBlob && navigator.canShare) {
        const pdfFile = new File([pdfBlob], pdfFilename || 'document.pdf', { type: 'application/pdf' })
        if (navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({ files: [pdfFile], text: message })
          setUsedShareApi(true)
          setStatus('ok')
          return
        }
      }

      // Desktop fallback: download PDF + open WhatsApp Web with pre-filled message
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = pdfFilename || 'document.pdf'
        a.click()
        URL.revokeObjectURL(url)
      }

      const waUrl = formattedPhone
        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank')
      setUsedShareApi(false)
      setStatus('ok')
    } catch (e) {
      if (e.name === 'AbortError') { setStatus(null); return } // user cancelled share sheet
      setStatus('error')
      setError(e.message || 'שגיאה בשליחה')
    }
  }

  const handleClose = () => {
    setStatus(null)
    setError('')
    setUsedShareApi(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="שליחה בוואטסאפ" size="sm">
      {status === 'ok' ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-gray-800 mb-1">
            {usedShareApi ? 'הקובץ שותף בהצלחה!' : 'וואטסאפ נפתח!'}
          </p>
          {!usedShareApi && (
            <p className="text-sm text-gray-500 mb-6">
              ה-PDF הורד — ניתן לצרף אותו לשיחה בוואטסאפ.
            </p>
          )}
          <Button onClick={handleClose}>סגור</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="מספר טלפון"
            type="tel"
            placeholder="05X-XXXXXXX"
            value={phone}
            onChange={e => { setPhone(e.target.value); setError('') }}
            error={error}
          />

          {whatsappData?.message && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
              {whatsappData.message}
            </div>
          )}

          {pdfBlob && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              📎 {pdfFilename} יצורף
            </div>
          )}

          <p className="text-xs text-gray-400">
            במכשיר נייד — הקובץ ישותף ישירות. במחשב — הקובץ יורד וחלון וואטסאפ נפתח.
          </p>

          <div className="flex justify-start gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>ביטול</Button>
            <Button onClick={handleSend} disabled={status === 'sending'}>
              {status === 'sending' ? 'מכין...' : '💬 שלח בוואטסאפ'}
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
