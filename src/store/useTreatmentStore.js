import { create } from 'zustand'
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy,
  arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../firebase'
import { deleteFile } from '../utils/storage'

export const useTreatmentStore = create((set, get) => ({
  treatments: [],
  loading: true,
  uid: null,
  patientId: null,
  allTreatments: [],
  allTreatmentsLoading: false,
  allTreatmentsLoaded: false,
  _unsubscribe: null,

  init(uid, patientId) {
    get()._unsubscribe?.()
    if (get().uid !== uid) {
      set({ allTreatments: [], allTreatmentsLoaded: false, allTreatmentsLoading: false })
    }
    if (!patientId) {
      set({ treatments: [], loading: false, uid, patientId: null, _unsubscribe: null })
      return
    }
    const q = query(
      collection(db, `users/${uid}/patients/${patientId}/treatments`),
      orderBy('date', 'desc'),
      orderBy('time', 'desc'),
    )
    const unsub = onSnapshot(q,
      (snap) => {
        set({ treatments: snap.docs.map(d => d.data()), loading: false })
      },
      (err) => {
        console.error('treatments listener:', err)
        set({ loading: false })
      },
    )
    set({ uid, patientId, loading: true, _unsubscribe: unsub })
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

  async addTreatment(data) {
    const { uid, patientId } = get()
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

  async updateTreatment(id, patch) {
    const { uid, patientId } = get()
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`),
      { ...patch, updatedAt: new Date().toISOString() },
    )

    // Update in allTreatments cache
    set(s => ({
      allTreatments: s.allTreatments.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)
    }))
  },

  async deleteTreatment(id) {
    const { uid, patientId } = get()
    const entry = get().treatments.find(t => t.id === id)
    if (entry?.files?.length) {
      await Promise.all(entry.files.map(f => deleteFile(f.storagePath)))
    }
    await deleteDoc(doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`))

    // Delete from allTreatments cache
    set(s => ({
      allTreatments: s.allTreatments.filter(t => t.id !== id)
    }))
  },

  async addFile(treatmentId, fileMeta) {
    const { uid, patientId } = get()
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: arrayUnion(fileMeta), updatedAt: new Date().toISOString() },
    )
  },

  async removeFile(treatmentId, fileMeta) {
    const { uid, patientId } = get()
    await deleteFile(fileMeta.storagePath)
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: arrayRemove(fileMeta), updatedAt: new Date().toISOString() },
    )
  },

  async renameFile(treatmentId, fileMeta, newName) {
    const { uid, patientId } = get()
    const treatment = get().treatments.find(t => t.id === treatmentId)
    const newFiles = (treatment?.files ?? []).map(f =>
      f.id === fileMeta.id ? { ...f, name: newName } : f
    )
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${treatmentId}`),
      { files: newFiles, updatedAt: new Date().toISOString() },
    )
  },
}))
