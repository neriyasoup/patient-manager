import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      // Active tab: a patient id, or null for the calendar (home) tab
      selectedPatientId: null,
      // Patient files open as tabs, in tab order
      openPatientIds: [],
      // { [patientId]: { [formKey]: true } } — forms with unsaved input, per tab
      editingForms: {},
      listQuery: '',
      globalQuery: '',
      globalSearchType: 'patient',

      // Opens the patient's tab (if not already open) and switches to it; null = calendar
      selectPatient: (id) => set(s => ({
        selectedPatientId: id,
        openPatientIds: id && !s.openPatientIds.includes(id) ? [...s.openPatientIds, id] : s.openPatientIds,
        globalQuery: '',
      })),

      closePatient: (id) => set(s => {
        const idx = s.openPatientIds.indexOf(id)
        if (idx === -1) return {}
        const openPatientIds = s.openPatientIds.filter(x => x !== id)
        let selectedPatientId = s.selectedPatientId
        if (selectedPatientId === id) {
          // Move to the neighbouring tab, or back to the calendar if none left
          selectedPatientId = openPatientIds[idx] ?? openPatientIds[idx - 1] ?? null
        }
        const { [id]: _drop, ...editingForms } = s.editingForms
        return { openPatientIds, selectedPatientId, editingForms }
      }),

      reorderPatientTabs: (fromId, toId) => set(s => {
        const ids = [...s.openPatientIds]
        const from = ids.indexOf(fromId)
        const to = ids.indexOf(toId)
        if (from === -1 || to === -1 || from === to) return {}
        ids.splice(to, 0, ids.splice(from, 1)[0])
        return { openPatientIds: ids }
      }),

      setFormEditing: (patientId, formKey, editing) => set(s => {
        if (!editing && !s.editingForms[patientId]?.[formKey]) return {}
        const forms = { ...(s.editingForms[patientId] ?? {}) }
        if (editing) forms[formKey] = true
        else delete forms[formKey]
        return { editingForms: { ...s.editingForms, [patientId]: forms } }
      }),

      setListQuery: (q) => set({ listQuery: q }),
      setGlobalQuery: (q) => set({ globalQuery: q }),
      setGlobalSearchType: (type) => set({ globalSearchType: type }),
    }),
    {
      name: 'clinic-ui',
      partialize: (s) => ({
        selectedPatientId: s.selectedPatientId,
        openPatientIds: s.openPatientIds,
        globalSearchType: s.globalSearchType,
      }),
      // Older saved state had only selectedPatientId — turn it into an open tab
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted ?? {}) }
        if (!Array.isArray(merged.openPatientIds)) merged.openPatientIds = []
        if (merged.selectedPatientId && !merged.openPatientIds.includes(merged.selectedPatientId)) {
          merged.openPatientIds = [...merged.openPatientIds, merged.selectedPatientId]
        }
        return merged
      },
    }
  )
)
