import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { formatCurrency, formatDate, getDerivedStatus } from '../../utils/formatters'
import { calcTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'

export function InvoiceCard({ invoice, onDelete }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)
  const client = getClient(invoice.clientId)
  const derivedStatus = getDerivedStatus(invoice)
  const { total } = calcTotal(invoice.lineItems, invoice.taxRate, invoice.discountType, invoice.discountValue)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div
        onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800">{invoice.number}</span>
          <Badge status={derivedStatus} />
        </div>

        <div className="text-base font-bold text-gray-900 mb-1 text-start">
          {client ? client.name : <span className="text-gray-400 text-sm">ללא לקוח</span>}
        </div>
        {client?.company && (
          <div className="text-sm text-gray-500 mb-2 text-start">{client.company}</div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-lg font-bold font-mono text-brand-500">
            {formatCurrency(total, invoice.currency)}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{formatDate(invoice.issueDate)}</div>
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); setShowConfirm(true) }}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="מחק"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); onDelete(invoice.id) }}
        title="מחיקת חשבונית"
        message={`האם למחוק את חשבונית ${invoice.number}? פעולה זו אינה ניתנת לביטול.`}
      />
    </>
  )
}
