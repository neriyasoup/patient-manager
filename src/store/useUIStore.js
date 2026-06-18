import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      selectedPatientId: null,
      listQuery: '',
      globalQuery: '',
      globalSearchType: 'patient',
      isTreatmentFormDirty: false,

      selectPatient: (id) => set({ selectedPatientId: id, globalQuery: '' }),
      setListQuery: (q) => set({ listQuery: q }),
      setGlobalQuery: (q) => set({ globalQuery: q }),
      setGlobalSearchType: (type) => set({ globalSearchType: type }),
      setTreatmentFormDirty: (dirty) => set({ isTreatmentFormDirty: dirty }),
    }),
    {
      name: 'clinic-ui',
      partialize: (s) => ({
        selectedPatientId: s.selectedPatientId,
        globalSearchType: s.globalSearchType,
      }),
    }
  )
)
