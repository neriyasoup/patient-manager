import { create } from 'zustand'
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy,
  arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../firebase'
import { deleteFile } from '../utils/storage'

const EMPTY = { treatments: [], loading: true }

// Treatments are kept per patient, so several patient tabs can be open at once.
export const useTreatmentStore = create((set, get) => ({
  byPatient: {},          // { [patientId]: { treatments, loading } }
  uid: null,
  allTreatments: [],
  allTreatmentsLoading: false,
  allTreatmentsLoaded: false,
  _subs: {},              // { [patientId]: unsubscribe }

  // Keep one live listener for every open patient tab
  sync(uid, patientIds) {
    const state = get()
    let subs = { ...state._subs }
    let byPatient = { ...state.byPatient }

    if (state.uid !== uid) {
      Object.values(subs).forEach(unsub => unsub?.())
      subs = {}
      byPatient = {}
      set({ allTreatments: [], allTreatmentsLoaded: false, allTreatmentsLoading: false })
    }

    const wanted = new Set(uid ? patientIds.filter(Boolean) : [])
    for (const pid of Object.keys(subs)) {
      if (!wanted.has(pid)) {
        subs[pid]?.()
        delete subs[pid]
        delete byPatient[pid]
      }
    }

    for (const pid of wanted) {
      if (subs[pid]) continue
      byPatient[pid] = { treatments: [], loading: true }
      const q = query(
        collection(db, `users/${uid}/patients/${pid}/treatments`),
        orderBy('date', 'desc'),
        orderBy('time', 'desc'),
      )
      subs[pid] = onSnapshot(q,
        (snap) => {
          if (!get()._subs[pid]) return
          set(s => ({ byPatient: { ...s.byPatient, [pid]: { treatments: snap.docs.map(d => d.data()), loading: false } } }))
        },
        (err) => {
          console.error('treatments listener:', err)
          if (!get()._subs[pid]) return
          set(s => ({ byPatient: { ...s.byPatient, [pid]: { ...(s.byPatient[pid] ?? EMPTY), loading: false } } }))
        },
      )
    }

    set({ uid, _subs: subs, byPatient })
  },

  async loadAllTreatments() {
    const { uid, allTreatmentsLoaded, allTreatmentsLoading } = get()
    if (!uid || allTreatmentsLoaded || allTreatmentsLoading) return
    set({ allTreatmentsLoading: true })
    try {
      const { collectionGroup, getDocs } = await import('firebase/firestore')
      const snap = await getDocs(collectionGroup(db, 'treatments'))
      const filtered = snap.docs
        .map(d => ({ ...d.data(), _path: d.ref.path }))
        .filter(t => t._path.startsWith(`users/${uid}/patients/`))
      set({ allTreatments: filtered, allTreatmentsLoaded: true, allTreatmentsLoading: false })
    } catch (err) {
      console.error('Failed to load all treatments for search:', err)
      set({ allTreatmentsLoading: false })
    }
  },

  async addTreatment(patientId, data) {
    const { uid } = get()
    const id = data.id || uuidv4()
    const now = new Date().toISOString()
    const entry = { ...data, id, patientId, files: data.files ?? [], createdAt: now, updatedAt: now }
    await setDoc(doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`), entry)

    // Add to allTreatments cache
    const entryWithPath = { ...entry, _path: `users/${uid}/patients/${patientId}/treatments/${id}` }
    set(s => ({
      allTreatments: [...s.allTreatments.filter(t => t.id !== id), entryWithPath]
    }))

    return id
  },

  async updateTreatment(patientId, id, patch) {
    const { uid } = get()
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`),
      { ...patch, updatedAt: new Date().toISOString() },
    )

    // Update in allTreatments cache
    set(s => ({
      allTreatments: s.allTreatments.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)
    }))
  },

  async deleteTreatment(patientId, id) {
    const { uid } = get()
    const entry = (get().byPatient[patientId]?.treatments ?? []).find(t => t.id === id)
    if (entry?.files?.length) {
      await Promise.all(entry.files.map(f => deleteFile(f.storagePath)))
    }
    await deleteDoc(doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`))

    // Delete from allTreatments cache
    set(s => ({
      allTreatments: s.allTreatments.filter(t => t.id !== id)
    }))
  },

  async addFile(patientId, treatmentId, fileMeta) {
    const { uid } = get()
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: arrayUnion(fileMeta), updatedAt: new Date().toISOString() },
    )
  },

  async removeFile(patientId, treatmentId, fileMeta) {
    const { uid } = get()
    await deleteFile(fileMeta.storagePath)
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: arrayRemove(fileMeta), updatedAt: new Date().toISOString() },
    )
  },

  async renameFile(patientId, treatmentId, fileMeta, newName) {
    const { uid } = get()
    const treatment = (get().byPatient[patientId]?.treatments ?? []).find(t => t.id === treatmentId)
    const newFiles = (treatment?.files ?? []).map(f =>
      f.id === fileMeta.id ? { ...f, name: newName } : f
    )
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: newFiles, updatedAt: new Date().toISOString() },
    )
  },
}))

// Treatments (and loading flag) of one patient
export function usePatientTreatments(patientId) {
  return useTreatmentStore(s => s.byPatient[patientId] ?? EMPTY)
}
