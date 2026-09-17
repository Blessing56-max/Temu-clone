import { cloudinaryUrl } from '@/lib/cloudinary'
import { CATEGORY_TINTS } from '@/lib/categoryTints'
import { discountPercent } from '@/components/PriceTag'
import { cn } from '@/lib/utils'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

function resolveImage(product) {
  let url = null

  if (product.images && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => (a.position || 0) - (b.position || 0))
    url = sorted[0].url
  } else if (product.image) {
    url = product.image
  }

  if (!url) return null

  // Full URLs pass through
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Relative /uploads/xxx.jpg → prepend backend host
  if (url.startsWith('/')) return API_BASE + url

  // Otherwise treat as Cloudinary public ID
  return cloudinaryUrl(url, { width: 600, height: 600, crop: 'fill' })
}

function computeDiscount(product) {
  if (product.discountPrice && product.price && Number(product.discountPrice) < Number(product.price)) {
    return Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
  }
  return discountPercent(product)
}

export default function ProductThumb({ product, className, iconSize = 32 }) {
  const tint = CATEGORY_TINTS[product.categoryName || product.category] || CATEGORY_TINTS.default
  const pct = computeDiscount(product)
  const src = resolveImage(product)

  return (
    <div className={cn('relative w-full h-full bg-paper', className)}>
      {pct && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-semibold text-white bg-coral rounded-md px-1.5 py-0.5">
          -{pct}%
        </span>
      )}
      {src ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center', tint.bg)}>
          <tint.Icon size={iconSize} className={tint.icon} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}