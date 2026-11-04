export function generateNumber(prefix, nextNumber) {
  return `${prefix}${String(nextNumber).padStart(4, '0')}`
}
