export function buildSearchText(patient) {
  if (!patient) return ''
  return [
    patient.firstName,
    patient.lastName,
    patient.email,
    patient.phone,
    patient.address,
    patient.occupation,
    patient.hobbies,
    patient.maritalStatus,
    patient.children,
    patient.permanentNotes,
    patient.parent1Name,
    patient.parent2Name,
  ].filter(Boolean).join(' ').toLowerCase()
}

export function searchPatients(patients, query) {
  if (!query || !query.trim()) return []
  const q = query.toLowerCase().trim()

  const scored = []
  for (const p of patients) {
    const first = (p.firstName || '').toLowerCase().trim()
    const last = (p.lastName || '').toLowerCase().trim()
    const full = `${first} ${last}`.trim()
    const reversed = `${last} ${first}`.trim()
    const parent1 = (p.parent1Name || '').toLowerCase().trim()
    const parent2 = (p.parent2Name || '').toLowerCase().trim()
    const phone = (p.phone || '').replace(/\D/g, '')
    const qDigits = q.replace(/\D/g, '')

    const words = `${first} ${last}`.split(/[\s\-]+/).filter(Boolean)
    const parentWords = `${parent1} ${parent2}`.split(/[\s\-]+/).filter(Boolean)

    let score = 0
    if (first === q || full === q || reversed === q) {
      score = 110
    } else if (first.startsWith(q)) {
      score = 100
    } else if (last.startsWith(q)) {
      score = 90
    } else if (full.startsWith(q) || reversed.startsWith(q)) {
      score = 85
    } else if (words.some(w => w.startsWith(q))) {
      score = 80
    } else if (parentWords.some(w => w.startsWith(q))) {
      score = 70
    } else if (qDigits.length > 0 && phone.includes(qDigits)) {
      score = 65
    } else if (q.length >= 2 && (full.includes(q) || reversed.includes(q))) {
      score = 50
    } else if (q.length >= 2 && (parent1.includes(q) || parent2.includes(q))) {
      score = 40
    }

    if (score > 0) {
      scored.push({ patient: p, score })
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const nameA = `${a.patient.firstName || ''} ${a.patient.lastName || ''}`
    const nameB = `${b.patient.firstName || ''} ${b.patient.lastName || ''}`
    return nameA.localeCompare(nameB, 'he')
  })

  return scored.map(item => item.patient)
}

export function getMatchSnippet(text, query, radius = 40) {
  if (!text || !query) return ''
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
