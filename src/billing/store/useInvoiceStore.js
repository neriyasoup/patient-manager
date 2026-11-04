import { create } from 'zustand'
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../firebase'
import { generateNumber } from '../utils/numbering'
import { useSettingsStore } from './useSettingsStore'

export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  loading: true,
  uid: null,
  _unsubscribe: null,

  init: (uid) => {
    const prev = get()._unsubscribe
    if (prev) prev()

    if (!uid) {
      set({ invoices: [], uid: null, loading: false, _unsubscribe: null })
      return
    }

    set({ uid, loading: true })
    const q = collection(db, `users/${uid}/invoices`)

    const unsubscribe = onSnapshot(q, (snap) => {
      const invoices = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      set({ invoices, loading: false })
    })

    set({ _unsubscribe: unsubscribe })
  },

  addInvoice: (data) => {
    const { uid } = get()
    if (!uid) return null

    const settings = useSettingsStore.getState()
    const num = settings.bumpInvoiceNumber()
    const number = generateNumber(settings.invoicePrefix, num)

    const today = new Date().toISOString().split('T')[0]
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const invoice = {
      id: uuidv4(),
      number,
      status: 'draft',
      clientId: null,
      issueDate: today,
      dueDate,
      lineItems: [],
      taxRate: settings.defaultTaxRate,
      discountType: 'none',
      discountValue: 0,
      notes: '',
      currency: settings.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }

    set(state => ({ invoices: [...state.invoices, invoice] }))
    setDoc(doc(db, `users/${uid}/invoices/${invoice.id}`), invoice).catch(console.error)
    return invoice
  },

  updateInvoice: (id, patch) => {
    const { uid } = get()
    if (!uid) return
    const update = { ...patch, updatedAt: new Date().toISOString() }
    set(state => ({ invoices: state.invoices.map(inv => inv.id === id ? { ...inv, ...update } : inv) }))
    updateDoc(doc(db, `users/${uid}/invoices/${id}`), update).catch(console.error)
  },

  deleteInvoice: (id) => {
    const { uid } = get()
    if (!uid) return
    deleteDoc(doc(db, `users/${uid}/invoices/${id}`)).catch(console.error)
  },

  setStatus: (id, status) => {
    get().updateInvoice(id, { status })
  },

  getById: (id) => get().invoices.find(inv => inv.id === id),
  getByClient: (clientId) => get().invoices.filter(inv => inv.clientId === clientId),
}))
