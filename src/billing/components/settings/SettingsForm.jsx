import { useState } from 'react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { useSettingsStore } from '../../store/useSettingsStore'

export function SettingsForm() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore(s => s.updateSettings)

  const [form, setForm] = useState({
    businessName: settings.businessName,
    ownerName: settings.ownerName,
    email: settings.email,
    phone: settings.phone,
    address: { ...settings.address },
    taxId: settings.taxId,
    logo: settings.logo,
    defaultTaxRate: settings.defaultTaxRate,
    invoicePrefix: settings.invoicePrefix,
    receiptPrefix: settings.receiptPrefix,
    nextInvoiceNumber: settings.nextInvoiceNumber,
    nextReceiptNumber: settings.nextReceiptNumber,
    paymentInfo: settings.paymentInfo,
    invoiceFooter: settings.invoiceFooter,
    showDigitalSignature: settings.showDigitalSignature ?? false,
  })

  const set = (patch) => setForm(f => ({ ...f, ...patch }))
  const setAddr = (patch) => setForm(f => ({ ...f, address: { ...f.address, ...patch } }))

  const [saved, setSaved] = useState(false)

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 300 * 1024) {
      alert('הלוגו גדול מדי. אנא השתמש בתמונה עד 300KB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => set({ logo: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const [tab, setTab] = useState('business')

  const tabs = [
    { id: 'business',  label: 'פרטי עסק' },
    { id: 'invoicing', label: 'חשבוניות וקבלות' },
    { id: 'payment',   label: 'תשלום' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'business' && (
        <div className="space-y-4">
          {/* Logo */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">לוגו</p>
            <div className="flex items-center gap-4">
              {form.logo && (
                <img src={form.logo} alt="לוגו" className="h-16 w-16 object-contain rounded border border-gray-200" />
              )}
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                  בחר תמונה
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                {form.logo && (
                  <button onClick={() => set({ logo: null })} className="mr-2 text-sm text-red-500 hover:underline">
                    הסר
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="שם העסק" value={form.businessName} onChange={e => set({ businessName: e.target.value })} />
            <Input label="שם הבעלים" value={form.ownerName} onChange={e => set({ ownerName: e.target.value })} />
            <Input type="email" label="אימייל" value={form.email} onChange={e => set({ email: e.target.value })} />
            <Input label="טלפון" value={form.phone} onChange={e => set({ phone: e.target.value })} />
            <Input label="מס' עוסק מורשה / ח.פ." value={form.taxId} onChange={e => set({ taxId: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="כתובת" value={form.address.line1} onChange={e => setAddr({ line1: e.target.value })} />
            <Input label="עיר" value={form.address.city} onChange={e => setAddr({ city: e.target.value })} />
            <Input label="מיקוד" value={form.address.postalCode} onChange={e => setAddr({ postalCode: e.target.value })} />
          </div>
        </div>
      )}

      {tab === 'invoicing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="קידומת חשבונית" value={form.invoicePrefix} onChange={e => set({ invoicePrefix: e.target.value })} />
            <Input type="number" label="מספר חשבונית הבא" min="1" value={form.nextInvoiceNumber} onChange={e => set({ nextInvoiceNumber: parseInt(e.target.value) })} />
            <Input label="קידומת קבלה" value={form.receiptPrefix} onChange={e => set({ receiptPrefix: e.target.value })} />
            <Input type="number" label="מספר קבלה הבא" min="1" value={form.nextReceiptNumber} onChange={e => set({ nextReceiptNumber: parseInt(e.target.value) })} />
            <Input type="number" label='מע"מ ברירת מחדל (%)' min="0" max="100" step="any" value={form.defaultTaxRate} onChange={e => set({ defaultTaxRate: parseFloat(e.target.value) })} />
          </div>
          
          <div className="flex items-start gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50/50 mt-2">
            <input
              type="checkbox"
              id="showDigitalSignature"
              checked={form.showDigitalSignature}
              onChange={e => set({ showDigitalSignature: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="showDigitalSignature" className="text-sm font-medium text-gray-900 cursor-pointer block select-none">
                הוסף חותמת ירוקה "נחתם דיגיטלית" על גבי מסמכי PDF
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                יוסיף חותמת ירוקה מעוצבת בתחתית החשבוניות והקבלות המציינת כי המסמך ממוחשב ונחתם דיגיטלית.
              </p>
            </div>
          </div>

          <Textarea label="טקסט תחתית (על כל המסמכים)" value={form.invoiceFooter} onChange={e => set({ invoiceFooter: e.target.value })} />
        </div>
      )}

      {tab === 'payment' && (
        <div className="space-y-4">
          <Textarea
            label="פרטי תשלום (יופיעו בחשבוניות)"
            placeholder="לדוגמה: בנק הפועלים, סניף 620, חשבון 12345678&#10;ביט / פייבוקס: 054-1234567"
            rows={5}
            value={form.paymentInfo}
            onChange={e => set({ paymentInfo: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mt-8">
        <Button onClick={handleSave}>שמור הגדרות</Button>
        {saved && <span className="text-sm text-green-600 font-medium">נשמר!</span>}
      </div>
    </div>
  )
}
