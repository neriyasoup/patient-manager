export function calcSubtotal(lineItems) {
  return lineItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  }, 0)
}

export function calcDiscount(subtotal, discountType, discountValue) {
  if (discountType === 'percent') {
    return subtotal * (Number(discountValue) || 0) / 100
  }
  if (discountType === 'fixed') {
    return Math.min(Number(discountValue) || 0, subtotal)
  }
  return 0
}

export function calcTax(amount, taxRate) {
  return amount * (Number(taxRate) || 0) / 100
}

export function calcTotal(lineItems, taxRate, discountType, discountValue) {
  const subtotal = calcSubtotal(lineItems)
  const discountAmount = calcDiscount(subtotal, discountType, discountValue)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = calcTax(taxableAmount, taxRate)
  const total = taxableAmount + taxAmount

  return { subtotal, discountAmount, taxAmount, total }
}

export function calcReceiptTotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
}
