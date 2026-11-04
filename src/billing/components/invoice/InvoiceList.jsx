import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { formatCurrency, formatDate, getDerivedStatus } from '../../utils/formatters'
import { calcTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'

export function InvoiceList({ invoices, selected, onToggle, onToggleAll }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="אין חשבוניות עדיין"
        description="צור חשבונית ראשונה לעסק שלך"
        action={() => navigate('/billing/invoices/new')}
        actionLabel="חשבונית חדשה"
      />
    )
  }

  const allSelected = invoices.length > 0 && invoices.every(inv => selected.has(inv.id))
  const someSelected = invoices.some(inv => selected.has(inv.id)) && !allSelected

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
            <th className="px-4 py-3 text-right font-semibold text-gray-600">סטטוס</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">סכום</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">תאריך</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => {
            const client = getClient(inv.clientId)
            const { total } = calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue)
            const isSelected = selected.has(inv.id)
            return (
              <tr
                key={inv.id}
                onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="w-10 px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(inv.id)}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{inv.number}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {client?.name || <span className="text-gray-400">ללא לקוח</span>}
                  </div>
                  {client?.company && <div className="text-xs text-gray-500">{client.company}</div>}
                </td>
                <td className="px-4 py-3">
                  <Badge status={getDerivedStatus(inv)} />
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-brand-500 whitespace-nowrap">
                  {formatCurrency(total, inv.currency)}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.issueDate)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
