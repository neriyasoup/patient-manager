import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { NewPatientForm } from '../client/NewPatientForm'
import { LineItemsTable } from './LineItemsTable'
import { InvoiceTotals } from './InvoiceTotals'
import { useClientStore } from '../../store/useClientStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { DISCOUNT_TYPES } from '../../constants'

const STATUSES = [
  { value: 'draft',     label: 'טיוטה' },
  { value: 'sent',      label: 'נשלח' },
  { value: 'paid',      label: 'שולם' },
  { value: 'cancelled', label: 'בוטל' },
]

export function InvoiceForm({ initial, onSave, onCancel }) {
  const clients = useClientStore(s => s.clients)
  const settings = useSettingsStore()
  const [newClientOpen, setNewClientOpen] = useState(false)

  const [form, setForm] = useState(() => ({
    clientId: '',
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0 }],
    taxRate: settings.defaultTaxRate,
    discountType: 'none',
    discountValue: 0,
    notes: '',
    currency: settings.currency,
    ...initial,
  }))

  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div className="space-y-6">
      {/* Top row: client + status + dates */}
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

        <Select
          label="סטטוס"
          value={form.status}
          onChange={e => set({ status: e.target.value })}
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>

        <Input
          type="date"
          label="תאריך הנפקה"
          value={form.issueDate}
          onChange={e => set({ issueDate: e.target.value })}
        />

        <Input
          type="date"
          label="תאריך פירעון"
          value={form.dueDate}
          onChange={e => set({ dueDate: e.target.value })}
        />
      </div>

      {/* Line items */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">פריטים</p>
        <LineItemsTable
          items={form.lineItems}
          onChange={items => set({ lineItems: items })}
          currency={form.currency}
        />
      </div>

      {/* Discount + tax */}
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="הנחה"
          value={form.discountType}
          onChange={e => set({ discountType: e.target.value, discountValue: 0 })}
        >
          {DISCOUNT_TYPES.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </Select>

        {form.discountType !== 'none' && (
          <Input
            type="number"
            label={form.discountType === 'percent' ? 'אחוז הנחה' : 'סכום הנחה'}
            min="0"
            step="any"
            value={form.discountValue}
            onChange={e => set({ discountValue: e.target.value })}
          />
        )}

        <Input
          type="number"
          label='מע"מ (%)'
          min="0"
          max="100"
          step="any"
          value={form.taxRate}
          onChange={e => set({ taxRate: e.target.value })}
        />
      </div>

      {/* Totals */}
      <div className="flex justify-start" style={{ direction: 'ltr' }}>
        <div style={{ direction: 'rtl' }}>
          <InvoiceTotals
            lineItems={form.lineItems}
            taxRate={form.taxRate}
            discountType={form.discountType}
            discountValue={form.discountValue}
            currency={form.currency}
          />
        </div>
      </div>

      {/* Notes */}
      <Textarea
        label="הערות"
        placeholder="הערות נוספות לחשבונית..."
        value={form.notes}
        onChange={e => set({ notes: e.target.value })}
      />

      {/* Actions */}
      <div className="flex justify-start gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button onClick={handleSave}>שמור חשבונית</Button>
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
