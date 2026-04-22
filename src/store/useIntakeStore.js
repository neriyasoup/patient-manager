import { create } from 'zustand'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_INTAKE } from '../constants'
import { usePatientStore } from './usePatientStore'

export const useIntakeStore = create((set, get) => ({
  intake: { ...DEFAULT_INTAKE },
  loading: true,
  uid: null,
  patientId: null,
  _unsubscribe: null,

  init(uid, patientId) {
    get()._unsubscribe?.()
    if (!patientId) {
      set({ intake: { ...DEFAULT_INTAKE }, loading: false, uid, patientId: null, _unsubscribe: null })
      return
    }
    const ref = doc(db, `users/${uid}/patients/${patientId}/intake/main`)
    const unsub = onSnapshot(ref, (snap) => {
      set({ intake: { ...DEFAULT_INTAKE, ...(snap.data() ?? {}) }, loading: false })
    })
    set({ uid, patientId, loading: true, _unsubscribe: unsub })
  },

  async updateIntake(patch) {
    const { uid, patientId } = get()
    if (!uid || !patientId) return
    const merged = { ...get().intake, ...patch }
    set({ intake: merged })
    const ref = doc(db, `users/${uid}/patients/${patientId}/intake/main`)
    await setDoc(ref, { ...patch, updatedAt: new Date().toISOString() }, { merge: true })
    usePatientStore.getState().updateSearchText(patientId, merged)
  },
}))
