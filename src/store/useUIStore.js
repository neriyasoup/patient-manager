import { create } from 'zustand'

export const useUIStore = create((set) => ({
  selectedPatientId: null,
  listQuery: '',
  globalQuery: '',
  intakePanelOpen: true,

  selectPatient: (id) => set({ selectedPatientId: id, globalQuery: '' }),
  setListQuery: (q) => set({ listQuery: q }),
  setGlobalQuery: (q) => set({ globalQuery: q }),
  toggleIntakePanel: () => set((s) => ({ intakePanelOpen: !s.intakePanelOpen })),
}))
