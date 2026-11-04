import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet
} from '@react-pdf/renderer'
import { calcReceiptTotal } from '../calculations'
import { formatCurrency, formatDate } from '../formatters'
import { PAYMENT_METHODS } from '../../constants'

const C = {
  navy:    '#1e3a5f',
  gray50:  '#f9fafb',
  gray100: '#f3f4f6',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  white:   '#ffffff',
}

const s = StyleSheet.create({
  page:         { fontFamily: 'NotoSansHebrew', fontSize: 10, color: C.gray900, padding: 40, backgroundColor: C.white },
  header:       { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo:         { width: 80, height: 80, objectFit: 'contain' },
  businessBlock:{ alignItems: 'flex-end' },
  businessName: { fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 },
  businessSub:  { fontSize: 9, color: C.gray500, textAlign: 'right', lineHeight: 1.5 },
  divider:      { borderBottomWidth: 2, borderBottomColor: C.navy, marginBottom: 20 },
  titleRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  docTitle:     { fontSize: 22, fontWeight: 700, color: C.navy },
  docNumber:    { fontSize: 12, color: C.gray500 },
  metaRow:      { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 24 },
  metaBlock:    { alignItems: 'flex-end' },
  metaLabel:    { fontSize: 8, color: C.gray500, marginBottom: 2 },
  metaValue:    { fontSize: 10, color: C.gray900 },
  tableHeader:  { flexDirection: 'row-reverse', backgroundColor: C.navy, padding: '6 8', borderRadius: 3, marginBottom: 2 },
  tableRow:     { flexDirection: 'row-reverse', padding: '5 8', borderBottomWidth: 1, borderBottomColor: C.gray100 },
  tableRowAlt:  { backgroundColor: C.gray50 },
  colDesc:      { flex: 4, textAlign: 'right' },
  colAmount:    { flex: 1.5, textAlign: 'right' },
  thText:       { color: C.white, fontSize: 9, fontWeight: 700 },
  tdText:       { fontSize: 9, color: C.gray700 },
  totalRow:     { flexDirection: 'row-reverse', justifyContent: 'space-between', width: 200, borderTopWidth: 1.5, borderTopColor: C.navy, paddingTop: 6, marginTop: 8 },
  totalText:    { fontSize: 11, fontWeight: 700, color: C.navy },
  paymentBox:   { marginTop: 20, padding: 12, backgroundColor: C.gray50, borderRadius: 4, alignItems: 'flex-end' },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: C.navy, marginBottom: 6, textAlign: 'right' },
  paymentText:  { fontSize: 9, color: C.gray700, lineHeight: 1.6, textAlign: 'right' },
  thankYou:     { marginTop: 28, textAlign: 'center', fontSize: 11, color: C.navy, fontWeight: 700 },
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
  footer:       { position: 'absolute', bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.gray300, paddingTop: 8 },
  footerText:   { fontSize: 8, color: C.gray500, textAlign: 'center' },
})

export function ReceiptPDF({ receipt, client, settings }) {
  const total = calcReceiptTotal(receipt.items)
  const fmt = v => formatCurrency(v, receipt.currency)
  const paymentLabel = PAYMENT_METHODS.find(m => m.value === receipt.paymentMethod)?.label || receipt.paymentMethod

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

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.docTitle}>קבלה</Text>
          <Text style={s.docNumber}>{receipt.number}</Text>
        </View>

        {/* Meta */}
        <View style={s.metaRow}>
          {client && (
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>התקבל מ</Text>
              <Text style={[s.metaValue, { fontWeight: 700 }]}>{client.name}</Text>
              {client.company && <Text style={s.metaValue}>{client.company}</Text>}
            </View>
          )}
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>תאריך</Text>
            <Text style={s.metaValue}>{formatDate(receipt.date)}</Text>
          </View>
        </View>

        {/* Items table */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>תיאור</Text>
          <Text style={[s.thText, s.colAmount]}>סכום</Text>
        </View>
        {receipt.items.map((item, i) => (
          <View key={item.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdText, s.colAmount]}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <View style={s.totalRow}>
            <Text style={s.totalText}>סה"כ</Text>
            <Text style={s.totalText}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={s.paymentBox}>
          <Text style={s.sectionTitle}>אמצעי תשלום</Text>
          <Text style={s.paymentText}>{paymentLabel}</Text>
          {receipt.paymentReference && (
            <Text style={s.paymentText}>אסמכתא: {receipt.paymentReference}</Text>
          )}
        </View>

        {/* Notes */}
        {receipt.notes && (
          <Text style={[s.paymentText, { marginTop: 12 }]}>{receipt.notes}</Text>
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
