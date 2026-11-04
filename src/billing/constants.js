export const INVOICE_STATUSES = {
  draft:     { label: 'טיוטה',   color: 'bg-gray-100 text-gray-700' },
  sent:      { label: 'נשלח',    color: 'bg-blue-100 text-blue-700' },
  paid:      { label: 'שולם',    color: 'bg-green-100 text-green-800' },
  overdue:   { label: 'באיחור',  color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'בוטל',    color: 'bg-gray-100 text-gray-400' },
}

export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'מזומן' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
  { value: 'credit_card',   label: 'כרטיס אשראי' },
  { value: 'check',         label: "צ'ק" },
  { value: 'bit',           label: 'ביט' },
  { value: 'paybox',        label: 'פייבוקס' },
  { value: 'other',         label: 'אחר' },
]

export const CURRENCIES = [
  { code: 'ILS', symbol: '₪', label: 'שקל חדש' },
  { code: 'USD', symbol: '$', label: 'דולר אמריקאי' },
  { code: 'EUR', symbol: '€', label: 'אירו' },
]

export const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
]

export const STORAGE_KEYS = {
  SETTINGS: 'inv_settings',
  INVOICES: 'inv_invoices',
  RECEIPTS: 'inv_receipts',
  CLIENTS:  'inv_clients',
}

export const DISCOUNT_TYPES = [
  { value: 'none',    label: 'ללא הנחה' },
  { value: 'percent', label: 'אחוז (%)' },
  { value: 'fixed',   label: 'סכום קבוע (₪)' },
]
