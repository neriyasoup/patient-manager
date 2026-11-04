import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useClientStore } from '../store/useClientStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { InvoiceList } from '../components/invoice/InvoiceList'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ExportModal } from '../components/ui/ExportModal'
import { BulkEmailModal } from '../components/ui/BulkEmailModal'
import { getDerivedStatus } from '../utils/formatters'
import { exportInvoicesToCsv } from '../utils/exportCsv'
import { buildInvoiceEmail } from '../utils/emailHtml'

export function InvoicesPage() {
  const navigate = useNavigate()
  const invoices = useInvoiceStore(s => s.invoices)
  const deleteInvoice = useInvoiceStore(s => s.deleteInvoice)
  const clients = useClientStore(s => s.clients)
  const getClient = useClientStore(s => s.getById)
  const settings = useSettingsStore()

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false)
  const [bulkEmailJobs, setBulkEmailJobs] = useState([])

  const filtered = invoices
    .filter(inv => {
      if (statusFilter !== 'all' && getDerivedStatus(inv) !== statusFilter) return false
      if (search) {
        const client = getClient(inv.clientId)
        const q = search.toLowerCase()
        return (
          inv.number.toLowerCase().includes(q) ||
          (client?.name || '').toLowerCase().includes(q) ||
          (client?.company || '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const toggleOne = id => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleAll = () => {
    const allSelected = filtered.every(inv => selected.has(inv.id))
    setSelected(allSelected ? new Set() : new Set(filtered.map(inv => inv.id)))
  }

  const deleteSelected = () => {
    selected.forEach(id => deleteInvoice(id))
    setSelected(new Set())
    setConfirmDelete(false)
  }

  const openBulkEmail = () => {
    const jobs = Array.from(selected).map(id => {
      const inv = invoices.find(i => i.id === id)
      const client = getClient(inv.clientId)
      const emailData = buildInvoiceEmail(inv, client, settings)
      return {
        number: inv.number,
        toEmail: emailData.toEmail,
        toName: emailData.toName,
        subject: emailData.subject,
        html: emailData.html,
        pdfFilename: `${inv.number}.pdf`,
        generatePdf: async () => {
          const [{ pdf }, { InvoicePDF }, { registerHebrewFont }] = await Promise.all([
            import('@react-pdf/renderer'),
            import('../utils/pdf/invoicePDF'),
            import('../utils/pdf/hebrewFont'),
          ])
          await registerHebrewFont()
          const { createElement } = await import('react')
          return pdf(createElement(InvoicePDF, { invoice: inv, client, settings })).toBlob()
        },
      }
    })
    setBulkEmailJobs(jobs)
    setBulkEmailOpen(true)
  }

  return (
    <PageWrapper
      title="חשבוניות"
      actions={
        <>
          {selected.size > 0 && (
            <>
              <Button variant="secondary" onClick={openBulkEmail}>
                📧 שלח באימייל ({selected.size})
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                מחק נבחרים ({selected.size})
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setExportOpen(true)}>📊 ייצוא ל-Sheets</Button>
          <Button onClick={() => navigate('/billing/invoices/new')}>+ חשבונית חדשה</Button>
        </>
      }
    >
      <div dir="rtl" className="flex gap-3 mb-6">
        <Input
          placeholder="חיפוש לפי לקוח או מספר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="sent">נשלח</option>
          <option value="paid">שולם</option>
          <option value="overdue">באיחור</option>
          <option value="cancelled">בוטל</option>
        </Select>
      </div>

      <InvoiceList
        invoices={filtered}
        selected={selected}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        title="מחיקת חשבוניות"
        message={`האם למחוק ${selected.size} חשבוניות? פעולה זו אינה ניתנת לביטול.`}
      />

      <BulkEmailModal
        isOpen={bulkEmailOpen}
        onClose={() => setBulkEmailOpen(false)}
        jobs={bulkEmailJobs}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="ייצוא חשבוניות ל-Google Sheets"
        onExport={(from, to) => exportInvoicesToCsv(invoices, clients, from, to)}
      />
    </PageWrapper>
  )
}
