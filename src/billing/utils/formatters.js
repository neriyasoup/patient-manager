import { format, parseISO, isValid } from 'date-fns'

export function formatCurrency(amount, currency = 'ILS') {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(isoString, dateFormat = 'dd/MM/yyyy') {
  if (!isoString) return ''
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : isoString
    if (!isValid(date)) return isoString
    return format(date, dateFormat)
  } catch {
    return isoString
  }
}

export function formatAddress(address) {
  if (!address) return ''
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.postalCode].filter(Boolean).join(' '),
    address.country,
  ].filter(Boolean)
  return parts.join('\n')
}

export function getDerivedStatus(invoice) {
  if (invoice.status === 'sent') {
    const today = new Date().toISOString().split('T')[0]
    if (invoice.dueDate && invoice.dueDate < today) {
      return 'overdue'
    }
  }
  return invoice.status
}
