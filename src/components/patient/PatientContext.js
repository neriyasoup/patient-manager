import { createContext, useContext } from 'react'

// The patient id of the tab a component is rendered in
export const PatientContext = createContext(null)

export function useCurrentPatientId() {
  return useContext(PatientContext)
}
