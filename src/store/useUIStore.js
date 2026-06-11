import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      selectedPatientId: null,
      listQuery: '',
      globalQuery: '',
      showAdditionalInfo: false,

      selectPatient: (id) => set({ selectedPatientId: id, globalQuery: '', showAdditionalInfo: false }),
      setListQuery: (q) => set({ listQuery: q }),
      setGlobalQuery: (q) => set({ globalQuery: q }),
      toggleAdditionalInfo: () => set((s) => ({ showAdditionalInfo: !s.showAdditionalInfo })),
      setAdditionalInfoOpen: (open) => set({ showAdditionalInfo: open }),
    }),
    {
      name: 'clinic-ui',
      partialize: (s) => ({ selectedPatientId: s.selectedPatientId, showAdditionalInfo: s.showAdditionalInfo }),
    }
  )
)
