import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet
} from '@react-pdf/renderer'
import { calcTotal } from '../calculations'
import { formatCurrency, formatDate } from '../formatters'
import { INVOICE_STATUSES } from '../../constants'

const C = {
  navy:      '#1e3a5f',
  navyLight: '#2d5282',
  gray50:    '#f9fafb',
  gray100:   '#f3f4f6',
  gray300:   '#d1d5db',
  gray500:   '#6b7280',
  gray700:   '#374151',
  gray900:   '#111827',
  green:     '#166534',
  greenBg:   '#dcfce7',
  white:     '#ffffff',
}

const s = StyleSheet.create({
  page:          { fontFamily: 'NotoSansHebrew', fontSize: 10, color: C.gray900, padding: 40, backgroundColor: C.white },
  header:        { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo:          { width: 80, height: 80, objectFit: 'contain' },
  businessBlock: { alignItems: 'flex-end' },
  businessName:  { fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 },
  businessSub:   { fontSize: 9, color: C.gray500, textAlign: 'right', lineHeight: 1.5 },
  divider:       { borderBottomWidth: 2, borderBottomColor: C.navy, marginBottom: 20 },
  titleRow:      { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  docTitle:      { fontSize: 22, fontWeight: 700, color: C.navy },
  docNumber:     { fontSize: 12, color: C.gray500 },
  metaRow:       { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 24 },
  metaBlock:     { alignItems: 'flex-end' },
  metaLabel:     { fontSize: 8, color: C.gray500, marginBottom: 2 },
  metaValue:     { fontSize: 10, color: C.gray900 },
  tableHeader:   { flexDirection: 'row-reverse', backgroundColor: C.navy, padding: '6 8', borderRadius: 3, marginBottom: 2 },
  tableRow:      { flexDirection: 'row-reverse', padding: '5 8', borderBottomWidth: 1, borderBottomColor: C.gray100 },
  tableRowAlt:   { backgroundColor: C.gray50 },
  colDesc:       { flex: 3, textAlign: 'right' },
  colQty:        { flex: 1, textAlign: 'center' },
  colPrice:      { flex: 1.5, textAlign: 'right' },
  colTotal:      { flex: 1.5, textAlign: 'right' },
  thText:        { color: C.white, fontSize: 9, fontWeight: 700 },
  tdText:        { fontSize: 9, color: C.gray700 },
  totalsSection: { marginTop: 12, width: 200 },
  totalsRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', width: 200, marginBottom: 4 },
  totalsLabel:   { fontSize: 9, color: C.gray500 },
  totalsValue:   { fontSize: 9, color: C.gray900, fontWeight: 700 },
  totalFinal:    { flexDirection: 'row-reverse', justifyContent: 'space-between', width: 200, borderTopWidth: 1.5, borderTopColor: C.navy, paddingTop: 6, marginTop: 4 },
  totalFinalTxt: { fontSize: 11, fontWeight: 700, color: C.navy },
  paymentSection:{ marginTop: 24, padding: 12, backgroundColor: C.gray50, borderRadius: 4, alignItems: 'flex-end' },
  sectionTitle:  { fontSize: 9, fontWeight: 700, color: C.navy, marginBottom: 6, textAlign: 'right' },
  paymentText:   { fontSize: 9, color: C.gray700, lineHeight: 1.6, textAlign: 'right' },
  notesSection:  { marginTop: 16, alignItems: 'flex-end' },
  notesText:     { fontSize: 9, color: C.gray500, lineHeight: 1.6, textAlign: 'right' },
  signatureSection: { marginTop: 24, flexDirection: 'row-reverse', justifyContent: 'flex-end', alignItems: 'center' },
  signatureBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: '6 12',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
  },
  signatureBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginLeft: 6,
  },
  signatureBadgeText: {
    color: '#15803d',
    fontSize: 8.5,
    fontWeight: 700,
  },
  footer:        { position: 'absolute', bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 8 },
  footerText:    { fontSize: 8, color: C.gray500, textAlign: 'center' },
})

function TotalsBlock({ lineItems, taxRate, discountType, discountValue, currency }) {
  const { subtotal, discountAmount, taxAmount, total } = calcTotal(lineItems, taxRate, discountType, discountValue)
  const fmt = v => formatCurrency(v, currency)

  return (
    <View style={s.totalsSection}>
      <View style={s.totalsRow}>
        <View><Text style={s.totalsLabel}>סכום לפני מע"מ</Text></View>
        <View><Text style={s.totalsValue}>{fmt(subtotal)}</Text></View>
      </View>
      {discountAmount > 0 && (
        <View style={s.totalsRow}>
          <View><Text style={s.totalsLabel}>הנחה</Text></View>
          <View><Text style={s.totalsValue}>-{fmt(discountAmount)}</Text></View>
        </View>
      )}
      {taxRate > 0 && (
        <View style={s.totalsRow}>
          <View><Text style={s.totalsLabel}>מע"מ ({taxRate}%)</Text></View>
          <View><Text style={s.totalsValue}>{fmt(taxAmount)}</Text></View>
        </View>
      )}
      <View style={s.totalFinal}>
        <View><Text style={s.totalFinalTxt}>סה"כ לתשלום</Text></View>
        <View><Text style={s.totalFinalTxt}>{fmt(total)}</Text></View>
      </View>
    </View>
  )
}

export function InvoicePDF({ invoice, client, settings }) {
  const statusLabel = INVOICE_STATUSES[invoice.status]?.label || invoice.status
  const fmt = v => formatCurrency(v, invoice.currency)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.businessBlock}>
            <Text style={s.businessName}>{settings.businessName || 'שם העסק'}</Text>
            {settings.taxId && <Text style={s.businessSub}>מס' עוסק: {settings.taxId}</Text>}
            {settings.phone && <Text style={s.businessSub}>{settings.phone}</Text>}
            {settings.email && <Text style={s.businessSub}>{settings.email}</Text>}
            {settings.address?.line1 && <Text style={s.businessSub}>{settings.address.line1}</Text>}
          </View>
          {settings.logo
            ? <Image style={s.logo} src={settings.logo} />
            : <View style={{ width: 80 }} />}
        </View>

        <View style={s.divider} />

        {/* Title row */}
        <View style={s.titleRow}>
          <Text style={s.docTitle}>חשבונית</Text>
          <Text style={s.docNumber}>{invoice.number} | {statusLabel}</Text>
        </View>

        {/* Meta: client + dates */}
        <View style={s.metaRow}>
          {client && (
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>לכבוד</Text>
              <Text style={[s.metaValue, { fontWeight: 700 }]}>{client.name}</Text>
              {client.company && <Text style={s.metaValue}>{client.company}</Text>}
              {client.taxId && <Text style={s.metaValue}>מס' עוסק: {client.taxId}</Text>}
              {client.address?.line1 && <Text style={s.metaValue}>{client.address.line1}</Text>}
            </View>
          )}
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>תאריך הנפקה</Text>
            <Text style={s.metaValue}>{formatDate(invoice.issueDate)}</Text>
            {invoice.dueDate && <>
              <Text style={[s.metaLabel, { marginTop: 6 }]}>תאריך פירעון</Text>
              <Text style={s.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </>}
          </View>
        </View>

        {/* Line items table */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>תיאור</Text>
          <Text style={[s.thText, s.colQty]}>כמות</Text>
          <Text style={[s.thText, s.colPrice]}>מחיר יחידה</Text>
          <Text style={[s.thText, s.colTotal]}>סה"כ</Text>
        </View>
        {invoice.lineItems.map((item, i) => (
          <View key={item.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdText, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdText, s.colPrice]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.tdText, s.colTotal]}>{fmt(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <TotalsBlock
            lineItems={invoice.lineItems}
            taxRate={invoice.taxRate}
            discountType={invoice.discountType}
            discountValue={invoice.discountValue}
            currency={invoice.currency}
          />
        </View>

        {/* Payment info */}
        {settings.paymentInfo && (
          <View style={s.paymentSection}>
            <Text style={s.sectionTitle}>פרטי תשלום</Text>
            <Text style={s.paymentText}>{settings.paymentInfo}</Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={s.notesSection}>
            <Text style={s.sectionTitle}>הערות</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Digital Signature Badge */}
        {settings.showDigitalSignature && (
          <View style={s.signatureSection}>
            <View style={s.signatureBadge}>
              <View style={s.signatureBadgeDot} />
              <Text style={s.signatureBadgeText}>מסמך ממוחשב - נחתם דיגיטלית</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          {settings.invoiceFooter && (
            <Text style={s.footerText}>{settings.invoiceFooter}</Text>
          )}
          <Text style={[s.footerText, { marginTop: 4, fontWeight: 700 }]}>מסמך ממוחשב</Text>
        </View>
      </Page>
    </Document>
  )
}
