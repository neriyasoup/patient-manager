import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../ui/EmptyState'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcReceiptTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'
import { PAYMENT_METHODS } from '../../constants'

export function ReceiptList({ receipts, selected, onToggle, onToggleAll }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)

  if (receipts.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="אין קבלות עדיין"
        description="צור קבלה ראשונה"
        action={() => navigate('/billing/receipts/new')}
        actionLabel="קבלה חדשה"
      />
    )
  }

  const allSelected = receipts.length > 0 && receipts.every(r => selected.has(r.id))
  const someSelected = receipts.some(r => selected.has(r.id)) && !allSelected

  return (
    <div dir="rtl" className="w-full overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-10 px-4 py-3 text-right">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected }}
                onChange={onToggleAll}
                className="rounded border-gray-300 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">מספר</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">לקוח</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">אמצעי תשלום</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">סכום</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">תאריך</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map(r => {
            const client = getClient(r.clientId)
            const total = calcReceiptTotal(r.items)
            const paymentLabel = PAYMENT_METHODS.find(m => m.value === r.paymentMethod)?.label || r.paymentMethod
            const isSelected = selected.has(r.id)
            return (
              <tr
                key={r.id}
                onClick={() => navigate(`/billing/receipts/${r.id}`)}
                className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="w-10 px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(r.id)}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{r.number}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {client?.name || <span className="text-gray-400">ללא לקוח</span>}
                  </div>
                  {client?.company && <div className="text-xs text-gray-500">{client.company}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{paymentLabel}</td>
                <td className="px-4 py-3 font-mono font-semibold text-brand-500 whitespace-nowrap">
                  {formatCurrency(total, r.currency)}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.date)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
