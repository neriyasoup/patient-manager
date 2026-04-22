import { create } from 'zustand'
import {
  collection, doc, onSnapshot, setDoc, updateDoc, query, where,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../firebase'
import { buildSearchText } from '../utils/searchIndex'

function patientPath(uid) {
  return collection(db, `users/${uid}/patients`)
}

export const usePatientStore = create((set, get) => ({
  patients: [],
  loading: true,
  uid: null,
  _unsubscribe: null,

  init(uid) {
    get()._unsubscribe?.()
    const q = query(patientPath(uid), where('deleted', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      const patients = snap.docs.map(d => d.data())
      patients.sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, 'he'))
      set({ patients, loading: false })
    })
    set({ uid, loading: true, _unsubscribe: unsub })
  },

  destroy() {
    get()._unsubscribe?.()
    set({ patients: [], loading: true, uid: null, _unsubscribe: null })
  },

  getById(id) {
    return get().patients.find(p => p.id === id) ?? null
  },

  async addPatient(data) {
    const { uid } = get()
    const id = uuidv4()
    const now = new Date().toISOString()
    const patient = {
      ...data,
      id,
      deleted: false,
      generalFiles: [],
      searchText: buildSearchText({ ...data, id }, {}),
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(doc(db, `users/${uid}/patients/${id}`), patient)
    return id
  },

  async updatePatient(id, patch) {
    const { uid } = get()
    const existing = get().getById(id) ?? {}
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    updated.searchText = buildSearchText(updated, {})
    await updateDoc(doc(db, `users/${uid}/patients/${id}`), {
      ...patch,
      searchText: updated.searchText,
      updatedAt: updated.updatedAt,
    })
  },

  async deletePatient(id) {
    const { uid } = get()
    await updateDoc(doc(db, `users/${uid}/patients/${id}`), {
      deleted: true,
      updatedAt: new Date().toISOString(),
    })
  },

  async addGeneralFile(patientId, fileMeta) {
    const { uid } = get()
    const { arrayUnion } = await import('firebase/firestore')
    await updateDoc(doc(db, `users/${uid}/patients/${patientId}`), {
      generalFiles: arrayUnion(fileMeta),
      updatedAt: new Date().toISOString(),
    })
  },

  async removeGeneralFile(patientId, fileMeta) {
    const { uid } = get()
    const { arrayRemove } = await import('firebase/firestore')
    await updateDoc(doc(db, `users/${uid}/patients/${patientId}`), {
      generalFiles: arrayRemove(fileMeta),
      updatedAt: new Date().toISOString(),
    })
  },

  async updateSearchText(patientId, intake) {
    const { uid } = get()
    const patient = get().getById(patientId)
    if (!patient) return
    const searchText = buildSearchText(patient, intake)
    await updateDoc(doc(db, `users/${uid}/patients/${patientId}`), { searchText })
  },
}))
