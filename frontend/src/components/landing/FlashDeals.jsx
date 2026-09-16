import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'

function useCountdown() {
  const [remaining, setRemaining] = useState(() => {
    const t = new Date()
    t.setHours(24, 0, 0, 0)
    return t - Date.now()
  })

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date()
      t.setHours(24, 0, 0, 0)
      setRemaining(t - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const c = Math.max(0, remaining)
  return {
    h: String(Math.floor(c / 3_600_000)).padStart(2, '0'),
    m: String(Math.floor((c % 3_600_000) / 60_000)).padStart(2, '0'),
    s: String(Math.floor((c % 60_000) / 1000)).padStart(2, '0'),
  }
}

export default function FlashDeals() {
  const { h, m, s } = useCountdown()
  const allProducts = useSelector((st) => st.catalog.products)
  const deals = allProducts
    .filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price))
    .slice(0, 4)

  return (
    <section className="relative bg-canopy py-16 overflow-hidden">
      <div className="absolute inset-0 market-grid opacity-25" aria-hidden="true" />
      <div className="container-page relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-leaf/25 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-leaf" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-onDark">
                Flash deals — up to 40% off
              </h2>
              <p className="text-onDark/55 text-sm mt-1">Ends when the clock hits zero.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {[h, m, s].map((unit, i) => (
                <div key={i} className="bg-white/10 rounded-xl px-3.5 py-2 text-center min-w-[56px]">
                  <div className="font-display text-xl font-semibold text-onDark tabular-nums">{unit}</div>
                  <div className="text-[10px] text-onDark/45 uppercase tracking-wide mt-0.5">
                    {['hrs', 'min', 'sec'][i]}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 bg-leaf text-onDark text-sm font-medium rounded-full px-5 py-2.5 hover:bg-leaf-dim transition-colors"
            >
              Shop deals <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {deals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deals.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-square">
                  <ProductThumb product={p} />
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium line-clamp-2 leading-snug">{p.name}</div>
                  <div className="mt-2">
                    <PriceTag product={p} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}