import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Star, ShoppingCart } from 'lucide-react'
import { useSelector } from 'react-redux'
import ProductThumb from '@/components/ProductThumb'

function useCountdown() {
  const [remain, setRemain] = useState(0)
  useEffect(() => {
    const tick = () => {
      const t = new Date()
      t.setHours(24, 0, 0, 0)
      setRemain(t - Date.now())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const c = Math.max(0, remain)
  return {
    h: String(Math.floor(c / 3_600_000)).padStart(2, '0'),
    m: String(Math.floor((c % 3_600_000) / 60_000)).padStart(2, '0'),
    s: String(Math.floor((c % 60_000) / 1000)).padStart(2, '0'),
  }
}

export default function FlashDeals() {
  const { h, m, s } = useCountdown()
  const allProducts = useSelector((st) => st.catalog.products)
  const deals = allProducts.filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price)).slice(0, 6)

  return (
    <section className="bg-paper py-10 md:py-14">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-coral/10 flex items-center justify-center">
              <Zap size={18} className="text-coral" strokeWidth={2.5} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-onLight">
                Flash Deals
              </h2>
              <p className="text-xs text-onLight/50">Limited time offers — don't miss out!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-onLight/55">Ends in</span>
              <div className="flex gap-1">
                {[h, m, s].map((v, i) => (
                  <span key={i} className="bg-ink text-onDark text-xs font-semibold px-2 py-1 rounded-md tabular-nums min-w-[26px] text-center">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/products" className="text-xs font-medium text-leaf-dim hover:underline whitespace-nowrap">
              View All &rarr;
            </Link>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-12 text-sm text-onLight/45">No deals right now.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {deals.map((p) => <DealCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function DealCard({ product }) {
  const price = Number(product.discountPrice || product.price)
  const original = Number(product.price)
  const pct = original > 0 ? Math.round((1 - price / original) * 100) : 0

  return (
    <Link to={'/products/' + product.id} className="group block">
      <div className="bg-white border border-onLight/8 rounded-2xl overflow-hidden hover:border-leaf/40 hover:-translate-y-1 transition-all">
        <div className="relative aspect-square bg-paper">
          <ProductThumb product={product} iconSize={26} />
          {pct > 0 && (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-coral rounded-md px-1.5 py-0.5">
              -{pct}%
            </span>
          )}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute bottom-2 right-2 size-8 rounded-full bg-white shadow-md flex items-center justify-center text-onLight/70 group-hover:bg-leaf group-hover:text-onDark transition-colors"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
        <div className="p-3">
          <div className="text-xs font-medium text-onLight line-clamp-2 leading-snug min-h-[32px]">
            {product.name}
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-bold text-sm text-coral">N{price.toLocaleString()}</span>
            {pct > 0 && (
              <span className="text-[10px] text-onLight/40 line-through">N{original.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-onLight/50">
            <Star size={9} className="fill-amber text-amber" />
            <span>4.7</span>
            <span className="text-onLight/30">&middot;</span>
            <span>120 sold</span>
          </div>
        </div>
      </div>
    </Link>
  )
}