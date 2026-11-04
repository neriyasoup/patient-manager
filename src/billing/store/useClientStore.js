import { create } from 'zustand'
import { usePatientStore } from '../../store/usePatientStore'

// In the clinic, the invoice "clients" are the clinic's patients.
// This store mirrors the patient list in the shape the invoice code expects.
export function patientToClient(p) {
  return {
    id: p.id,
    name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
    company: '',
    email: p.email || '',
    phone: p.phone || '',
    address: { line1: p.address || '', line2: '', city: '', postalCode: '', country: '' },
    taxId: p.taxId || '',
    notes: '',
  }
}

const toClients = (patients) => patients.map(patientToClient)

export const useClientStore = create((set, get) => ({
  clients: toClients(usePatientStore.getState().patients),
  getById: (id) => get().clients.find(c => c.id === id),
}))

usePatientStore.subscribe((state, prev) => {
  if (state.patients !== prev.patients) {
    useClientStore.setState({ clients: toClients(state.patients) })
  }
})
