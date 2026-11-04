import clsx from 'clsx'
import { INVOICE_STATUSES } from '../../constants'

export function Badge({ status, className }) {
  const info = INVOICE_STATUSES[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', info.color, className)}>
      {info.label}
    </span>
  )
}
