import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/landing/SectionHeading'
import ProductCard from '@/components/ProductCard'
import { useToast } from '@/context/ToastContext'
import { addToCartApi } from '@/store/slices/catalogSlice'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'discount', label: 'On Sale' },
  { id: 'new', label: 'New In' },
  { id: 'top', label: 'Top Rated' },
]

export default function ProductShowcase() {
  const dispatch = useDispatch()
  const all = useSelector((s) => s.catalog.products)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [tab, setTab] = useState('all')
  const toast = useToast()

  const products = useMemo(() => {
    if (tab === 'discount') return all.filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price))
    if (tab === 'new') return [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (tab === 'top') return [...all].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    return all
  }, [all, tab])

  const shown = products.slice(0, 8)

  async function add(p) {
    if (!isAuthed) {
      toast.push({ type: 'error', title: 'Log in to add items', description: 'Create an account or sign in to start shopping.' })
      return
    }
    const action = await dispatch(addToCartApi({ productId: p.id, quantity: 1 }))
    if (addToCartApi.fulfilled.match(action)) {
      toast.push({ type: 'success', title: 'Added to cart', description: p.name })
    } else {
      toast.push({ type: 'error', title: 'Could not add item', description: action.payload || 'Try again.' })
    }
  }

  return (
    <section className="bg-paper py-10 md:py-14">
      <div className="container-page">
        <SectionHeading
          eyebrow="Hot right now"
          title="Trending on Kora"
          subtitle="The products everyone is buying this week."
          viewAllTo="/products"
        />

        <div className="flex gap-1.5 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={'shrink-0 text-xs font-medium rounded-full px-4 py-2 transition-colors ' + (tab === t.id ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          >
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} onAdd={add} isAuthed={isAuthed} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {shown.length === 0 && (
          <div className="text-center py-16 text-onLight/45 text-sm">Nothing here yet.</div>
        )}
      </div>
    </section>
  )
}