import { create } from 'zustand'
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const defaultSettings = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: { line1: '', line2: '', city: '', postalCode: '', country: 'ישראל' },
  taxId: '',
  logo: null,
  currency: 'ILS',
  defaultTaxRate: 17,
  invoicePrefix: 'חשב-',
  receiptPrefix: 'קבלה-',
  nextInvoiceNumber: 1,
  nextReceiptNumber: 1,
  paymentInfo: '',
  invoiceFooter: '',
  dateFormat: 'dd/MM/yyyy',
  showDigitalSignature: false,
}

export const useSettingsStore = create((set, get) => ({
  ...defaultSettings,
  loading: true,
  uid: null,
  _unsubscribe: null,

  init: (uid) => {
    const prev = get()._unsubscribe
    if (prev) prev()

    if (!uid) {
      set({ ...defaultSettings, uid: null, loading: false, _unsubscribe: null })
      return
    }

    set({ uid, loading: true })
    const ref = doc(db, `users/${uid}/settings/main`)

    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        set({ ...snap.data(), loading: false })
      } else {
        await setDoc(ref, defaultSettings)
        set({ ...defaultSettings, loading: false })
      }
    })

    set({ _unsubscribe: unsubscribe })
  },

  updateSettings: (patch) => {
    const { uid } = get()
    set(patch)
    if (uid) {
      updateDoc(doc(db, `users/${uid}/settings/main`), patch).catch(console.error)
    }
  },

  bumpInvoiceNumber: () => {
    const { uid, nextInvoiceNumber } = get()
    const current = nextInvoiceNumber
    set({ nextInvoiceNumber: current + 1 })
    if (uid) {
      updateDoc(doc(db, `users/${uid}/settings/main`), { nextInvoiceNumber: current + 1 }).catch(console.error)
    }
    return current
  },

  bumpReceiptNumber: () => {
    const { uid, nextReceiptNumber } = get()
    const current = nextReceiptNumber
    set({ nextReceiptNumber: current + 1 })
    if (uid) {
      updateDoc(doc(db, `users/${uid}/settings/main`), { nextReceiptNumber: current + 1 }).catch(console.error)
    }
    return current
  },
}))
