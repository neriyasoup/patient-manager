import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { useReceiptStore } from '../store/useReceiptStore'
import { useClientStore } from '../store/useClientStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate, getDerivedStatus } from '../utils/formatters'
import { calcTotal, calcReceiptTotal } from '../utils/calculations'

const MONTHS_HE = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']
const PIE_COLORS = ['#1e3a5f', '#2d5282', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8']

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="font-mono text-blue-700">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const invoices = useInvoiceStore(s => s.invoices)
  const receipts = useReceiptStore(s => s.receipts)
  const getClient = useClientStore(s => s.getById)
  const clients = useClientStore(s => s.clients)

  const now = new Date()
  const currentYear = now.getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Invoice-based: used only for ממתין לתשלום
  const withTotals = useMemo(() => invoices.map(inv => ({
    ...inv,
    derivedStatus: getDerivedStatus(inv),
    total: calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue).total,
  })), [invoices])
  const outstanding = withTotals.filter(i => ['sent', 'overdue'].includes(i.derivedStatus))
  const totalOutstanding = outstanding.reduce((s, i) => s + i.total, 0)

  // Receipt-based: all revenue calculations
  const receiptWithTotals = useMemo(() => receipts.map(r => ({
    ...r,
    total: calcReceiptTotal(r.items),
  })), [receipts])

  const totalRevenue = receiptWithTotals.reduce((s, r) => s + r.total, 0)
  const totalPaid = totalRevenue

  const currentMonthRevenue = useMemo(() => {
    const m = now.getMonth(), y = now.getFullYear()
    return receiptWithTotals
      .filter(r => {
        const d = new Date(r.date)
        return d.getFullYear() === y && d.getMonth() === m
      })
      .reduce((s, r) => s + r.total, 0)
  }, [receiptWithTotals])

  // Bar chart: monthly receipts for selected year
  const availableYears = useMemo(() => {
    const years = new Set(receiptWithTotals.map(r => new Date(r.date).getFullYear()))
    years.add(currentYear)
    return [...years].sort((a, b) => b - a)
  }, [receiptWithTotals, currentYear])

  const monthlyData = useMemo(() => {
    return MONTHS_HE.map((label, month) => ({
      label,
      value: receiptWithTotals
        .filter(r => {
          const d = new Date(r.date)
          return d.getFullYear() === selectedYear && d.getMonth() === month
        })
        .reduce((s, r) => s + r.total, 0),
    }))
  }, [receiptWithTotals, selectedYear])

  // Pie chart: revenue by client from receipts
  const clientRevenue = useMemo(() => {
    const map = {}
    for (const r of receiptWithTotals) {
      if (!map[r.clientId]) map[r.clientId] = 0
      map[r.clientId] += r.total
    }
    return Object.entries(map)
      .map(([clientId, value]) => ({
        name: getClient(clientId)?.name || 'לא ידוע',
        value,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [receiptWithTotals, getClient])

  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  const recentReceipts = [...receipts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  return (
    <PageWrapper
      title="לוח בקרה"
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => navigate('/billing/receipts/new')}>+ קבלה חדשה</Button>
          <Button size="sm" onClick={() => navigate('/billing/invoices/new')}>+ חשבונית חדשה</Button>
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="הכנסות כוללות" value={formatCurrency(totalRevenue)} color="text-indigo-700" sub={`${receipts.length} קבלות`} />
        <StatCard label="הכנסות החודש" value={formatCurrency(currentMonthRevenue)} color="text-purple-700" />
        <StatCard label="שולם" value={formatCurrency(totalPaid)} color="text-green-700" sub={`${receipts.length} קבלות`} />
        <StatCard label="ממתין לתשלום" value={formatCurrency(totalOutstanding)} color="text-blue-700" sub={`${outstanding.length} חשבוניות`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">הכנסות חודשיות</h2>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4 text-start">הכנסות לפי לקוח</h2>
          {clientRevenue.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">אין נתונים</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={clientRevenue}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={32}
                >
                  {clientRevenue.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>}
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">חשבוניות אחרונות</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/billing/invoices')}>כל החשבוניות</Button>
        </div>
        {recentInvoices.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">אין חשבוניות עדיין</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">מספר</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">לקוח</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">תאריך</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">סטטוס</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">סכום</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, i) => {
                  const client = getClient(inv.clientId)
                  const { total } = calcTotal(inv.lineItems, inv.taxRate, inv.discountType, inv.discountValue)
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                      className={`cursor-pointer hover:bg-gray-50 ${i < recentInvoices.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-start">{inv.number}</td>
                      <td className="px-4 py-3 text-gray-600 text-start">{client?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-start">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-start"><Badge status={getDerivedStatus(inv)} /></td>
                      <td className="px-4 py-3 font-mono font-semibold text-start">{formatCurrency(total, inv.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent receipts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">קבלות אחרונות</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/billing/receipts')}>כל הקבלות</Button>
        </div>
        {recentReceipts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">אין קבלות עדיין</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">מספר</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">לקוח</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">תאריך</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500">סכום</th>
                </tr>
              </thead>
              <tbody>
                {recentReceipts.map((r, i) => {
                  const client = getClient(r.clientId)
                  const total = calcReceiptTotal(r.items)
                  return (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/billing/receipts/${r.id}`)}
                      className={`cursor-pointer hover:bg-gray-50 ${i < recentReceipts.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-start">{r.number}</td>
                      <td className="px-4 py-3 text-gray-600 text-start">{client?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-start">{formatDate(r.date)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-start">{formatCurrency(total, r.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
