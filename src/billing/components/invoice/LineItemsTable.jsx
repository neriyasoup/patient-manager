import { v4 as uuidv4 } from 'uuid'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/formatters'

function newItem() {
  return { id: uuidv4(), description: '', quantity: 1, unitPrice: 0 }
}

export function LineItemsTable({ items, onChange, currency = 'ILS' }) {
  const update = (id, field, value) => {
    onChange(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const remove = (id) => {
    if (items.length === 1) return
    onChange(items.filter(item => item.id !== id))
  }

  const add = () => onChange([...items, newItem()])

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 px-1 mb-1">
        <span className="text-xs font-medium text-gray-500">תיאור</span>
        <span className="text-xs font-medium text-gray-500 text-center">כמות</span>
        <span className="text-xs font-medium text-gray-500 text-end">מחיר יחידה</span>
        <span className="text-xs font-medium text-gray-500 text-end">סה"כ</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {items.map(item => {
          const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
          return (
            <div key={item.id} className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 items-center">
              <input
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="תיאור השירות / המוצר"
                value={item.description}
                onChange={e => update(item.id, 'description', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="any"
                className="rounded-md border border-gray-300 px-2 py-2 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={item.quantity}
                onChange={e => update(item.id, 'quantity', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="any"
                className="rounded-md border border-gray-300 px-2 py-2 text-sm text-end font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={item.unitPrice}
                onChange={e => update(item.id, 'unitPrice', e.target.value)}
              />
              <div className="text-sm font-mono text-end text-gray-700 px-1">
                {formatCurrency(lineTotal, currency)}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={items.length === 1}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg leading-none text-center"
                title="הסר שורה"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={add}>
        + הוסף שורה
      </Button>
    </div>
  )
}
