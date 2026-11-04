import { calcTotal } from '../../utils/calculations'
import { formatCurrency } from '../../utils/formatters'

export function InvoiceTotals({ lineItems, taxRate, discountType, discountValue, currency = 'ILS' }) {
  const { subtotal, discountAmount, taxAmount, total } = calcTotal(
    lineItems, taxRate, discountType, discountValue
  )
  const fmt = v => formatCurrency(v, currency)

  return (
    <div className="flex justify-end">
      <table className="text-sm w-64">
        <tbody>
          <tr className="text-gray-600">
            <td className="py-1 font-medium text-start">סכום ביניים</td>
            <td className="py-1 font-mono text-end">{fmt(subtotal)}</td>
          </tr>
          {discountAmount > 0 && (
            <tr className="text-gray-600">
              <td className="py-1 font-medium text-start">הנחה</td>
              <td className="py-1 font-mono text-end text-red-600">-{fmt(discountAmount)}</td>
            </tr>
          )}
          {taxRate > 0 && (
            <tr className="text-gray-600">
              <td className="py-1 font-medium text-start">מע"מ ({taxRate}%)</td>
              <td className="py-1 font-mono text-end">{fmt(taxAmount)}</td>
            </tr>
          )}
          <tr className="border-t border-gray-300 font-bold text-gray-900 text-base">
            <td className="pt-2 text-start">סה"כ לתשלום</td>
            <td className="pt-2 font-mono text-end">{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
