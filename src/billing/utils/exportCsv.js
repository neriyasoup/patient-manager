import { calcTotal, calcReceiptTotal } from './calculations'
import { formatDate } from './formatters'
import { PAYMENT_METHODS } from '../constants'

function toCsv(rows) {
  return rows
    .map(row =>
      row.map(cell => {
        const val = cell == null ? '' : String(cell)
        // Wrap in quotes if contains comma, newline or quote
        return val.includes(',') || val.includes('\n') || val.includes('"')
          ? `"${val.replace(/"/g, '""')}"`
          : val
      }).join(',')
    )
    .join('\n')
}

function download(content, filename) {
  // BOM for Excel/Sheets to detect UTF-8 (Hebrew)
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportInvoicesToCsv(invoices, clients, from, to) {
  const getClient = (id) => clients.find(c => c.id === id)

  const filtered = invoices.filter(inv => {
    if (from && inv.issueDate < from) return false
    if (to   && inv.issueDate > to)   return false
    return true
  })

  const STATUS_MAP = {
    draft: 'טיוטה', sent: 'נשלח', paid: 'שולם',
    overdue: 'באיחור', cancelled: 'בוטל',
  }

  const rows = [
    ['מספר', 'תאריך הנפקה', 'תאריך פירעון', 'לקוח', 'חברה', 'סטטוס', 'סכום לפני מע"מ', 'הנחה', 'מע"מ', 'סה"כ', 'מטבע'],
    ...filtered.map(inv => {
      const client = getClient(inv.clientId)
      const { subtotal, discountAmount, taxAmount, total } = calcTotal(
        inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue
      )
      return [
        inv.number,
        formatDate(inv.issueDate),
        formatDate(inv.dueDate),
        client?.name || '',
        client?.company || '',
        STATUS_MAP[inv.status] || inv.status,
        subtotal.toFixed(2),
        discountAmount.toFixed(2),
        taxAmount.toFixed(2),
        total.toFixed(2),
        inv.currency,
      ]
    })
  ]

  download(toCsv(rows), `חשבוניות_${from}_${to}.csv`)
  return filtered.length
}

export function exportReceiptsToCsv(receipts, clients, from, to) {
  const getClient = (id) => clients.find(c => c.id === id)

  const filtered = receipts.filter(r => {
    if (from && r.date < from) return false
    if (to   && r.date > to)   return false
    return true
  })

  const rows = [
    ['מספר', 'תאריך', 'לקוח', 'חברה', 'אמצעי תשלום', 'אסמכתא', 'סה"כ', 'מטבע'],
    ...filtered.map(r => {
      const client = getClient(r.clientId)
      const total = calcReceiptTotal(r.items)
      const paymentLabel = PAYMENT_METHODS.find(m => m.value === r.paymentMethod)?.label || r.paymentMethod
      return [
        r.number,
        formatDate(r.date),
        client?.name || '',
        client?.company || '',
        paymentLabel,
        r.paymentReference || '',
        total.toFixed(2),
        r.currency,
      ]
    })
  ]

  download(toCsv(rows), `קבלות_${from}_${to}.csv`)
  return filtered.length
}
