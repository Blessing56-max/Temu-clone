export function discountPercent(product) {
  const price = Number(product.price)
  const original = Number(product.discountPrice || product.originalPrice)
  if (!original || !price || original <= price) return null
  return Math.round((1 - price / original) * 100)
}

function fmt(v) {
  return Number(v).toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

export default function PriceTag({ product, size = 'sm' }) {
  const price = Number(product.discountPrice || product.price)
  const original = product.discountPrice ? Number(product.price) : null
  const priceClass = size === 'lg' ? 'text-2xl font-semibold' : 'text-sm font-semibold'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={priceClass}>&#8358;{fmt(price)}</span>
      {original && (
        <span className="text-xs text-onLight/35 line-through">&#8358;{fmt(original)}</span>
      )}
    </div>
  )
}