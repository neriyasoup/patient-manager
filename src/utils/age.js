import { differenceInYears, parseISO } from 'date-fns'

export function calcAge(dob) {
  if (!dob) return null
  try {
    let iso = dob
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
      const [d, m, y] = dob.split('/')
      iso = `${y}-${m}-${d}`
    }
    const age = differenceInYears(new Date(), parseISO(iso))
    return Number.isNaN(age) ? null : age
  } catch {
    return null
  }
}
