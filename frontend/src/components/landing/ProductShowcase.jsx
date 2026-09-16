import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import ProductCard from '@/components/ProductCard'
import { addToCartApi } from '@/store/slices/catalogSlice'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'discount', label: 'On sale' },
  { id: 'new', label: 'New in' },
]

export default function ProductShowcase() {
  const dispatch = useDispatch()
  const allProducts = useSelector((s) => s.catalog.products)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [tab, setTab] = useState('all')

  const products = useMemo(() => {
    if (tab === 'discount') return allProducts.filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price))
    if (tab === 'new') return [...allProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return allProducts
  }, [allProducts, tab])

  const shown = products.slice(0, 8)

  function add(p) {
    dispatch(addToCartApi({ productId: p.id, quantity: 1 }))
  }

  return (
    <section className="bg-paper py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-medium text-leaf-dim">Right now</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Trending on Kora</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline flex items-center gap-1">
            All products <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs font-medium rounded-full px-3.5 py-2 transition-colors ${
                tab === t.id ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} onAdd={add} isAuthed={isAuthed} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {shown.length === 0 && (
          <div className="text-center py-20 text-onLight/45 text-sm">No products yet.</div>
        )}
      </div>
    </section>
  )
}