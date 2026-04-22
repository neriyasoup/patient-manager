import { differenceInYears, parseISO } from 'date-fns'

export function calcAge(dob) {
  if (!dob) return null
  try {
    return differenceInYears(new Date(), parseISO(dob))
  } catch {
    return null
  }
}
