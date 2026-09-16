import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import CursorRipple from '@/components/CursorRipple'
import ProductGlobeCarousel from '@/components/ProductGlobeCarousel'
import { CATEGORY_TINTS } from '@/lib/categoryTints'

const QUICK_CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Health', 'Sports & Outdoors']

// Fallback products for the carousel — shown before backend responds (or if it's down)
const FALLBACK_CAROUSEL = [
  { id: 'p-1',  name: 'Wireless Headphones', price: 38000, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' }] },
  { id: 'p-2',  name: 'Smart Watch Pro',      price: 72000, images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' }] },
  { id: 'p-5',  name: 'Canvas Sneakers',      price: 28000, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }] },
  { id: 'p-8',  name: 'Sunglasses UV400',     price: 20000, images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80' }] },
  { id: 'p-9',  name: 'Yoga Mat Premium',     price: 16000, images: [{ url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80' }] },
  { id: 'p-13', name: 'Organic Coffee',       price: 15000, images: [{ url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80' }] },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const products = useSelector((s) => s.catalog.products)

  // Use real products if they have images; else use fallbacks so carousel always spins
  const withImages = products.filter((p) => (p.images && p.images.length > 0) || p.image)
  const carousel = (withImages.length > 0 ? withImages : FALLBACK_CAROUSEL).slice(0, 6)

  const pop = (delay) => ({
    initial: { opacity: 0, y: 14, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  })

  return (
    <section className="relative min-h-[88vh] bg-paper overflow-hidden flex items-center">
      <div className="absolute inset-0 market-dots" aria-hidden="true" />
      <CursorRipple />

      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-leaf/14 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[380px] h-[380px] rounded-full bg-canopy/10 blur-[100px] pointer-events-none" />

      <div className="container-page relative z-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center py-20 md:py-24">
        <div>
          <motion.div {...pop(0)} className="inline-flex items-center gap-2 text-xs font-medium text-leaf-dim bg-leaf/10 border border-leaf/20 rounded-full px-3 py-1.5 mb-6">
            <ShieldCheck size={13} /> Every vendor verified before they list
          </motion.div>

          <motion.h1
            {...pop(0.1)}
            className="font-display text-5xl md:text-7xl font-semibold text-onLight leading-[1.02] tracking-tight"
          >
            Made by someone.
            <br />
            <span className="text-leaf-dim">Found by you.</span>
          </motion.h1>

          <motion.p {...pop(0.35)} className="mt-6 text-lg text-onLight/60 max-w-md">
            Kora connects independent makers and small vendors with people looking for things worth buying — no algorithmic noise, just a feed built around what you actually want.
          </motion.p>

          <motion.div {...pop(0.45)} className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" variant="primary" onClick={() => navigate('/products')}>
              Browse products <ArrowRight size={15} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/sell')}>
              Start selling
            </Button>
          </motion.div>

          <motion.div {...pop(0.55)} className="mt-8 flex flex-wrap gap-3">
            {QUICK_CATEGORIES.map((cat) => {
              const tint = CATEGORY_TINTS[cat] || CATEGORY_TINTS.default
              return (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-onLight/8 hover:border-leaf/40 transition-colors group"
                >
                  <span className={`size-7 rounded-full flex items-center justify-center ${tint.bg}`}>
                    <tint.Icon size={13} className={tint.icon} strokeWidth={1.75} />
                  </span>
                  <span className="text-xs text-onLight/65 group-hover:text-leaf-dim">{cat}</span>
                </Link>
              )
            })}
          </motion.div>
        </div>

        <ProductGlobeCarousel products={carousel} className="hidden md:block" />
      </div>
    </section>
  )
}