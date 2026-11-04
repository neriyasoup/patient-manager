import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcReceiptTotal } from '../../utils/calculations'
import { useClientStore } from '../../store/useClientStore'
import { PAYMENT_METHODS } from '../../constants'
import { ConfirmDialog } from '../ui/ConfirmDialog'

export function ReceiptCard({ receipt, onDelete }) {
  const navigate = useNavigate()
  const getClient = useClientStore(s => s.getById)
  const client = getClient(receipt.clientId)
  const total = calcReceiptTotal(receipt.items)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div
        onClick={() => navigate(`/billing/receipts/${receipt.id}`)}
        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-brand-500 transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800">{receipt.number}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            קבלה
          </span>
        </div>

        <div className="text-base font-bold text-gray-900 mb-1 text-start">
          {client ? client.name : <span className="text-gray-400 text-sm">ללא לקוח</span>}
        </div>
        <div className="text-sm text-gray-500 text-start">{paymentLabel}</div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-lg font-bold font-mono text-brand-500">
            {formatCurrency(total, receipt.currency)}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{formatDate(receipt.date)}</div>
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
        onConfirm={() => { setShowConfirm(false); onDelete(receipt.id) }}
        title="מחיקת קבלה"
        message={`האם למחוק את קבלה ${receipt.number}? פעולה זו אינה ניתנת לביטול.`}
      />
    </>
  )
}
