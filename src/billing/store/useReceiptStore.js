import { create } from 'zustand'
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../firebase'
import { generateNumber } from '../utils/numbering'
import { useSettingsStore } from './useSettingsStore'

export const useReceiptStore = create((set, get) => ({
  receipts: [],
  loading: true,
  uid: null,
  _unsubscribe: null,

  init: (uid) => {
    const prev = get()._unsubscribe
    if (prev) prev()

    if (!uid) {
      set({ receipts: [], uid: null, loading: false, _unsubscribe: null })
      return
    }

    set({ uid, loading: true })
    const q = collection(db, `users/${uid}/receipts`)

    const unsubscribe = onSnapshot(q, (snap) => {
      const receipts = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      set({ receipts, loading: false })
    })

    set({ _unsubscribe: unsubscribe })
  },

  addReceipt: (data) => {
    const { uid } = get()
    if (!uid) return null

    const settings = useSettingsStore.getState()
    const num = settings.bumpReceiptNumber()
    const number = generateNumber(settings.receiptPrefix, num)

    const today = new Date().toISOString().split('T')[0]

    const receipt = {
      id: uuidv4(),
      number,
      invoiceId: null,
      clientId: null,
      date: today,
      items: [],
      paymentMethod: 'cash',
      paymentReference: '',
      notes: '',
      currency: settings.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }

    set(state => ({ receipts: [...state.receipts, receipt] }))
    setDoc(doc(db, `users/${uid}/receipts/${receipt.id}`), receipt).catch(console.error)
    return receipt
  },

  updateReceipt: (id, patch) => {
    const { uid } = get()
    if (!uid) return
    const update = { ...patch, updatedAt: new Date().toISOString() }
    set(state => ({ receipts: state.receipts.map(r => r.id === id ? { ...r, ...update } : r) }))
    updateDoc(doc(db, `users/${uid}/receipts/${id}`), update).catch(console.error)
  },

  deleteReceipt: (id) => {
    const { uid } = get()
    if (!uid) return
    deleteDoc(doc(db, `users/${uid}/receipts/${id}`)).catch(console.error)
  },

  getById: (id) => get().receipts.find(r => r.id === id),
  getByInvoice: (invoiceId) => get().receipts.filter(r => r.invoiceId === invoiceId),
}))
