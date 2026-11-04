import { formatCurrency } from './formatters'

function buildSimpleHtml(businessName) {
  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;direction:rtl;color:#111827;padding:24px">
<p>מצורפת חשבונית/קבלה</p>
<p>תודה רבה</p>
<p>${businessName || ''}</p>
</body></html>`
}

export function buildInvoiceEmail(invoice, client, settings) {
  return {
    html:     buildSimpleHtml(settings.businessName),
    subject:  `חשבונית ${invoice.number} מאת ${settings.businessName || 'העסק'}`,
    toEmail:  client?.email || '',
    toName:   client?.name  || '',
  }
}

export function buildReceiptEmail(receipt, client, settings) {
  return {
    html:     buildSimpleHtml(settings.businessName),
    subject:  `קבלה ${receipt.number} מאת ${settings.businessName || 'העסק'}`,
    toEmail:  client?.email || '',
    toName:   client?.name  || '',
  }
}

export function buildInvoiceWhatsApp(invoice, client, settings, total) {
  const biz = settings.businessName || 'העסק'
  const greeting = client?.name ? `שלום ${client.name},\n\n` : ''
  const totalLine = total != null ? `\nסכום לתשלום: ${formatCurrency(total, invoice.currency)}` : ''
  const message = `${greeting}מצורפת חשבונית ${invoice.number} מאת ${biz}.${totalLine}\n\nתודה!`
  return { phone: client?.phone || '', message }
}

export function buildReceiptWhatsApp(receipt, client, settings, total) {
  const biz = settings.businessName || 'העסק'
  const greeting = client?.name ? `שלום ${client.name},\n\n` : ''
  const totalLine = total != null ? `\nסכום ששולם: ${formatCurrency(total, receipt.currency)}` : ''
  const message = `${greeting}מצורפת קבלה ${receipt.number} מאת ${biz}.${totalLine}\n\nתודה!`
  return { phone: client?.phone || '', message }
}
