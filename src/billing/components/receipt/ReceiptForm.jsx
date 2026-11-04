import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { NewPatientForm } from '../client/NewPatientForm'
import { useClientStore } from '../../store/useClientStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { PAYMENT_METHODS } from '../../constants'
import { calcReceiptTotal } from '../../utils/calculations'
import { formatCurrency } from '../../utils/formatters'

function newItem() {
  return { id: uuidv4(), description: '', amount: 0 }
}

export function ReceiptForm({ initial, onSave, onCancel }) {
  const clients = useClientStore(s => s.clients)
  const settings = useSettingsStore()
  const [newClientOpen, setNewClientOpen] = useState(false)

  const [form, setForm] = useState(() => ({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    items: [newItem()],
    paymentMethod: 'cash',
    paymentReference: '',
    notes: '',
    currency: settings.currency,
    ...initial,
  }))

  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  const updateItem = (id, field, value) => {
    set({ items: form.items.map(item => item.id === id ? { ...item, [field]: value } : item) })
  }

  const removeItem = (id) => {
    if (form.items.length === 1) return
    set({ items: form.items.filter(item => item.id !== id) })
  }

  const addItem = () => set({ items: [...form.items, newItem()] })

  const total = calcReceiptTotal(form.items)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="מטופל / לקוח"
              value={form.clientId || ''}
              onChange={e => set({ clientId: e.target.value || null })}
            >
              <option value="">בחר מטופל...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>
              ))}
            </Select>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setNewClientOpen(true)}>
            + מטופל חדש
          </Button>
        </div>

        <Input
          type="date"
          label="תאריך"
          value={form.date}
          onChange={e => set({ date: e.target.value })}
        />

        <Select
          label="אמצעי תשלום"
          value={form.paymentMethod}
          onChange={e => set({ paymentMethod: e.target.value })}
        >
          {PAYMENT_METHODS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>

        <Input
          label="אסמכתא / מס' המחאה"
          placeholder="אופציונלי"
          value={form.paymentReference}
          onChange={e => set({ paymentReference: e.target.value })}
        />
      </div>

      {/* Items */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">פריטים</p>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_120px_32px] gap-2 px-1">
            <span className="text-xs font-medium text-gray-500">תיאור</span>
            <span className="text-xs font-medium text-gray-500 text-end">סכום</span>
            <span />
          </div>
          {form.items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
              <input
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="תיאור"
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="any"
                className="rounded-md border border-gray-300 px-2 py-2 text-sm text-end font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={item.amount}
                onChange={e => updateItem(item.id, 'amount', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={form.items.length === 1}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none text-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addItem}>
          + הוסף שורה
        </Button>
      </div>

      {/* Total */}
      <div className="text-end">
        <span className="text-base font-bold text-gray-900">
          סה"כ: {formatCurrency(total, form.currency)}
        </span>
      </div>

      <Textarea
        label="הערות"
        placeholder="הערות נוספות..."
        value={form.notes}
        onChange={e => set({ notes: e.target.value })}
      />

      <div className="flex justify-start gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button onClick={() => onSave(form)}>שמור קבלה</Button>
      </div>

      <Modal isOpen={newClientOpen} onClose={() => setNewClientOpen(false)} title="מטופל חדש" size="lg">
        <NewPatientForm
          onSaved={(client) => {
            set({ clientId: client.id })
            setNewClientOpen(false)
          }}
          onCancel={() => setNewClientOpen(false)}
        />
      </Modal>
    </div>
  )
}
