import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      selectedPatientId: null,
      listQuery: '',
      globalQuery: '',
      intakePanelOpen: true,

      selectPatient: (id) => set({ selectedPatientId: id, globalQuery: '' }),
      setListQuery: (q) => set({ listQuery: q }),
      setGlobalQuery: (q) => set({ globalQuery: q }),
      toggleIntakePanel: () => set((s) => ({ intakePanelOpen: !s.intakePanelOpen })),
    }),
    {
      name: 'clinic-ui',
      partialize: (s) => ({ selectedPatientId: s.selectedPatientId }),
    }
  )
)
