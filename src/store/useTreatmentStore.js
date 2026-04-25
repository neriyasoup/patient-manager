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
  _unsubscribe: null,

  init(uid, patientId) {
    get()._unsubscribe?.()
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

  async addTreatment(data) {
    const { uid, patientId } = get()
    const id = uuidv4()
    const now = new Date().toISOString()
    const entry = { ...data, id, files: data.files ?? [], createdAt: now, updatedAt: now }
    await setDoc(doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`), entry)
    return id
  },

  async updateTreatment(id, patch) {
    const { uid, patientId } = get()
    await updateDoc(
      doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`),
      { ...patch, updatedAt: new Date().toISOString() },
    )
  },

  async deleteTreatment(id) {
    const { uid, patientId } = get()
    const entry = get().treatments.find(t => t.id === id)
    if (entry?.files?.length) {
      await Promise.all(entry.files.map(f => deleteFile(f.storagePath)))
    }
    await deleteDoc(doc(db, `users/${uid}/patients/${patientId}/treatments/${id}`))
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
