import { useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'

export function ExportModal({ isOpen, onClose, onExport, title }) {
  const today = new Date().toISOString().split('T')[0]
  const firstOfYear = `${new Date().getFullYear()}-01-01`

  const [from, setFrom] = useState(firstOfYear)
  const [to, setTo]     = useState(today)
  const [count, setCount] = useState(null)

  const handleExport = () => {
    const exported = onExport(from, to)
    setCount(exported)
  }

  const handleClose = () => {
    setCount(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="מתאריך"
            value={from}
            onChange={e => { setFrom(e.target.value); setCount(null) }}
          />
          <Input
            type="date"
            label="עד תאריך"
            value={to}
            onChange={e => { setTo(e.target.value); setCount(null) }}
          />
        </div>

        {count !== null && (
          <div className={`text-sm rounded-lg px-3 py-2 ${count > 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {count > 0
              ? `✅ יוצאו ${count} רשומות — הקובץ הורד`
              : '⚠️ לא נמצאו רשומות בטווח התאריכים הזה'}
          </div>
        )}

        <div className="text-xs text-gray-400">
          הקובץ יישמר כ-CSV. פתח אותו ב-Google Sheets עם:
          <br />
          File → Import → Upload → בחר את הקובץ
        </div>

        <div className="flex justify-start gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose}>סגור</Button>
          <Button onClick={handleExport}>⬇ ייצוא לקובץ</Button>
        </div>
      </div>
    </Modal>
  )
}
