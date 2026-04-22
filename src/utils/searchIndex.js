export function buildSearchText(patient, intake = {}) {
  return [
    patient.firstName,
    patient.lastName,
    patient.email,
    patient.phone,
    patient.address,
    intake.chiefComplaint,
    intake.complaintHistory,
    intake.currentMedications,
    intake.supplements,
    intake.allergies,
    intake.medicalConditions,
    intake.tcmDiagnosis,
    intake.zangFuPattern,
    intake.treatmentGoals,
  ].filter(Boolean).join(' ').toLowerCase()
}

export function searchPatients(patients, query) {
  if (!query || !query.trim()) return []
  const q = query.toLowerCase().trim()
  return patients.filter(p => p.searchText?.includes(q))
}

export function getMatchSnippet(text, query, radius = 40) {
  if (!text || !query) return ''
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
