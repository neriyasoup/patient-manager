import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useClientStore } from '../store/useClientStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { InvoiceForm } from '../components/invoice/InvoiceForm'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InvoiceTotals } from '../components/invoice/InvoiceTotals'
import { SendEmailModal } from '../components/ui/SendEmailModal'
import { SendWhatsAppModal } from '../components/ui/SendWhatsAppModal'
import { formatCurrency, formatDate, getDerivedStatus } from '../utils/formatters'
import { useReceiptStore } from '../store/useReceiptStore'
import { calcTotal } from '../utils/calculations'
import { PAYMENT_METHODS } from '../constants'
import { buildInvoiceEmail, buildInvoiceWhatsApp } from '../utils/emailHtml'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = !id

  const addInvoice = useInvoiceStore(s => s.addInvoice)
  const updateInvoice = useInvoiceStore(s => s.updateInvoice)
  const deleteInvoice = useInvoiceStore(s => s.deleteInvoice)
  const loading = useInvoiceStore(s => s.loading)
  const storeInvoice = useInvoiceStore(s => id ? s.invoices.find(inv => inv.id === id) : null)
  const navInvoice = id && location.state?.invoice?.id === id ? location.state.invoice : null
  const existingInvoice = storeInvoice ?? navInvoice
  const getClient = useClientStore(s => s.getById)
  const settings = useSettingsStore()

  const [editMode, setEditMode] = useState(false)
  const isEditing = isNew || editMode
  const [showDelete, setShowDelete] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailOpen, setEmailOpen]   = useState(false)
  const [emailPdfBlob, setEmailPdfBlob] = useState(null)
  const [waLoading, setWaLoading] = useState(false)
  const [waOpen, setWaOpen] = useState(false)
  const [waPdfBlob, setWaPdfBlob] = useState(null)

  if (!isNew && loading && !navInvoice) {
    return <PageWrapper title="טוען..."><div className="text-gray-400 text-sm">טוען חשבונית...</div></PageWrapper>
  }

  if (!isNew && !existingInvoice) {
    return (
      <PageWrapper title="חשבונית לא נמצאה">
        <Button onClick={() => navigate('/billing/invoices')}>חזרה לחשבוניות</Button>
      </PageWrapper>
    )
  }

  const invoice = existingInvoice

  const handleSave = (formData) => {
    if (isNew) {
      const created = addInvoice(formData)
      navigate(`/billing/invoices/${created.id}`, { replace: true, state: { invoice: created } })
    } else {
      updateInvoice(id, formData)
      setEditMode(false)
    }
  }

  const handleDelete = () => {
    deleteInvoice(id)
    navigate('/billing/invoices')
  }

  const handleDownloadPDF = async () => {
    const client = getClient(invoice.clientId)
    setPdfLoading(true)
    try {
      const [{ pdf }, { InvoicePDF }, { registerHebrewFont }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../utils/pdf/invoicePDF'),
        import('../utils/pdf/hebrewFont'),
      ])
      await registerHebrewFont()
      const blob = await pdf(<InvoicePDF invoice={invoice} client={client} settings={settings} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleOpenEmailModal = async () => {
    const client = getClient(invoice.clientId)
    setEmailLoading(true)
    try {
      const [{ pdf }, { InvoicePDF }, { registerHebrewFont }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../utils/pdf/invoicePDF'),
        import('../utils/pdf/hebrewFont'),
      ])
      await registerHebrewFont()
      const blob = await pdf(<InvoicePDF invoice={invoice} client={client} settings={settings} />).toBlob()
      setEmailPdfBlob(blob)
      setEmailOpen(true)
    } catch (err) {
      console.error('PDF generation for email failed:', err)
      setEmailPdfBlob(null)
      setEmailOpen(true)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleOpenWhatsAppModal = async () => {
    const client = getClient(invoice.clientId)
    setWaLoading(true)
    try {
      const [{ pdf }, { InvoicePDF }, { registerHebrewFont }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../utils/pdf/invoicePDF'),
        import('../utils/pdf/hebrewFont'),
      ])
      await registerHebrewFont()
      const blob = await pdf(<InvoicePDF invoice={invoice} client={client} settings={settings} />).toBlob()
      setWaPdfBlob(blob)
      setWaOpen(true)
    } catch (err) {
      console.error('PDF generation for WhatsApp failed:', err)
      setWaPdfBlob(null)
      setWaOpen(true)
    } finally {
      setWaLoading(false)
    }
  }

  const handleConvertToReceipt = () => {
    if (invoice) {
      navigate(`/billing/receipts/new?fromInvoice=${invoice.id}`)
    }
  }

  const handleMarkPaid = () => {
    updateInvoice(id, { status: 'paid' })
  }

  if (isNew || isEditing) {
    return (
      <PageWrapper title={isNew ? 'חשבונית חדשה' : `עריכת ${invoice.number}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <InvoiceForm
            initial={isNew ? { clientId: location.state?.clientId || '' } : invoice}
            onSave={handleSave}
            onCancel={() => isNew ? navigate('/billing/invoices') : setEditMode(false)}
          />
        </div>
      </PageWrapper>
    )
  }

  // View mode
  const client = getClient(invoice.clientId)
  const derivedStatus = getDerivedStatus(invoice)
  const { subtotal, discountAmount, taxAmount, total } = calcTotal(
    invoice.lineItems, invoice.taxRate, invoice.discountType, invoice.discountValue
  )

  return (
    <PageWrapper
      title={invoice.number}
      actions={
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'paid' && (
            <Button variant="secondary" size="sm" onClick={handleMarkPaid}>סמן כשולם</Button>
          )}
          <Button variant="secondary" size="sm" disabled={emailLoading} onClick={handleOpenEmailModal}>
            {emailLoading ? 'מייצר...' : '📧 שלח באימייל'}
          </Button>
          <Button variant="secondary" size="sm" disabled={waLoading} onClick={handleOpenWhatsAppModal}>
            {waLoading ? 'מייצר...' : '💬 וואטסאפ'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleConvertToReceipt}>צור קבלה</Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>הדפס</Button>
          <Button variant="secondary" size="sm" disabled={pdfLoading} onClick={handleDownloadPDF}>
            {pdfLoading ? 'מייצר...' : 'הורד PDF'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>ערוך</Button>
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>מחק</Button>
        </div>
      }
    >
      <div id="print-area" className="bg-white rounded-xl border border-gray-200 p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-end">
            <p className="text-xs text-gray-500">מס׳ חשבונית</p>
            <p className="text-lg font-bold">{invoice.number}</p>
            <Badge status={derivedStatus} className="mt-1" />
          </div>
          <div>
            {settings.logo && (
              <img src={settings.logo} alt="לוגו" className="h-16 object-contain mb-2" />
            )}
            <p className="font-bold text-xl text-brand-500">{settings.businessName || 'העסק שלי'}</p>
            {settings.taxId && <p className="text-sm text-gray-500">מס׳ עוסק: {settings.taxId}</p>}
            {settings.phone && <p className="text-sm text-gray-500">{settings.phone}</p>}
          </div>
        </div>

        <div className="border-t-2 border-brand-500 mb-6" />

        {/* Dates + client */}
        <div className="flex justify-between mb-8">
          {client && (
            <div className="text-end">
              <p className="text-xs text-gray-500 mb-1">לכבוד</p>
              <p className="font-bold">{client.name}</p>
              {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
              {client.taxId && <p className="text-sm text-gray-500">מס׳ עוסק: {client.taxId}</p>}
              {client.address?.line1 && <p className="text-sm text-gray-500">{client.address.line1}</p>}
            </div>
          )}
          <div>
            <div className="mb-2">
              <p className="text-xs text-gray-500">תאריך הנפקה</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-xs text-gray-500">תאריך פירעון</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-brand-500 text-white">
              <th className="px-3 py-2 text-right border-l border-white/20 rounded-r-md">תיאור</th>
              <th className="px-3 py-2 text-center border-l border-white/20 w-20">כמות</th>
              <th className="px-3 py-2 text-right border-l border-white/20 w-32">מחיר יחידה</th>
              <th className="px-3 py-2 text-right rounded-l-md w-32">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, i) => (
              <tr key={item.id} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2 text-right border-l border-gray-100">{item.description}</td>
                <td className="px-3 py-2 text-center border-l border-gray-100 font-mono">{item.quantity}</td>
                <td className="px-3 py-2 text-right border-l border-gray-100 font-mono">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="px-3 py-2 text-right font-mono font-medium">
                  {formatCurrency(item.quantity * item.unitPrice, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-start" style={{ direction: 'ltr' }}>
          <div style={{ direction: 'rtl' }}>
            <InvoiceTotals
              lineItems={invoice.lineItems}
              taxRate={invoice.taxRate}
              discountType={invoice.discountType}
              discountValue={invoice.discountValue}
              currency={invoice.currency}
            />
          </div>
        </div>

        {/* Payment info */}
        {settings.paymentInfo && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-brand-500 mb-1">פרטי תשלום</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{settings.paymentInfo}</p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">הערות</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          {settings.invoiceFooter && (
            <p className="text-xs text-gray-400 mb-1">{settings.invoiceFooter}</p>
          )}
          <p className="text-xs text-gray-500 font-semibold">מסמך ממוחשב</p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="מחיקת חשבונית"
        message={`האם למחוק את חשבונית ${invoice.number}? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
      />

      <SendEmailModal
        isOpen={emailOpen}
        onClose={() => { setEmailOpen(false); setEmailPdfBlob(null) }}
        emailData={invoice && buildInvoiceEmail(invoice, getClient(invoice.clientId), settings)}
        pdfBlob={emailPdfBlob}
        pdfFilename={invoice ? `${invoice.number}.pdf` : undefined}
      />

      <SendWhatsAppModal
        isOpen={waOpen}
        onClose={() => { setWaOpen(false); setWaPdfBlob(null) }}
        whatsappData={invoice && buildInvoiceWhatsApp(invoice, getClient(invoice.clientId), settings, total)}
        pdfBlob={waPdfBlob}
        pdfFilename={invoice ? `${invoice.number}.pdf` : undefined}
      />
    </PageWrapper>
  )
}
