import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      selectedPatientId: null,
      listQuery: '',
      globalQuery: '',

      selectPatient: (id) => set({ selectedPatientId: id, globalQuery: '' }),
      setListQuery: (q) => set({ listQuery: q }),
      setGlobalQuery: (q) => set({ globalQuery: q }),
    }),
    {
      name: 'clinic-ui',
      partialize: (s) => ({ selectedPatientId: s.selectedPatientId }),
    }
  )
)
