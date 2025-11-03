export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0
  })
  .format(price)
  .replace("ETB", "")   // Remove "ETB"
  .trim() + " ETB";     // Add ETB at end
}
