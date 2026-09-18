import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import MarketplaceSearch from '@/components/landing/MarketplaceSearch'
import ProductCubeSlider from '@/components/landing/ProductCubeSlider'

const FALLBACK = [
  { id: 'f1', name: 'Wireless Headphones', price: 38000, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' }] },
  { id: 'f2', name: 'Smart Watch Pro', price: 72000, images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' }] },
  { id: 'f3', name: 'Canvas Sneakers', price: 28000, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }] },
  { id: 'f4', name: 'Sunglasses UV400', price: 20000, images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80' }] },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const products = useSelector((s) => s.catalog.products)
  const withImages = products.filter((p) => (p.images && p.images.length > 0) || p.image)
  const cubeProducts = (withImages.length >= 4 ? withImages : FALLBACK).slice(0, 4)

  return (
    <section className="relative bg-ink overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-leaf/25 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-canopy/40 blur-[120px] pointer-events-none" />

      <div className="container-page relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-medium text-leaf bg-leaf/15 border border-leaf/30 rounded-full px-3 py-1.5 mb-5"
          >
            <Star size={11} fill="currentColor" /> Trusted by 32,000+ shoppers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-onDark leading-[1.02] tracking-tight"
          >
            <span className="italic font-serif text-leaf">Real</span> finds.
            <br />
            <span className="text-leaf">Bigger</span> savings.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-5 text-onDark/70 text-base md:text-lg max-w-md leading-relaxed"
          >
            Top products. Crazy deals. All in one place. Shop smart. Live better.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-7">
            <MarketplaceSearch />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-leaf text-onDark font-semibold text-sm rounded-full px-6 py-3 hover:bg-leaf-dim transition-colors"
            >
              Shop now <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="inline-flex items-center gap-2 border border-onDark/25 text-onDark text-sm rounded-full px-6 py-3 hover:border-onDark/50 transition-colors"
            >
              Start selling
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-7 flex items-center gap-5 text-xs text-onDark/55">
            <div className="flex items-center gap-1.5">
              <div className="flex">{[1,2,3,4,5].map((n) => <Star key={n} size={10} fill="currentColor" className="text-amber" />)}</div>
              <span>4.8 rating</span>
            </div>
            <span>&middot;</span>
            <span>Free shipping over N50k</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden md:flex justify-center"
        >
          <ProductCubeSlider products={cubeProducts} />
        </motion.div>
      </div>

      {/* Handwritten annotation */}
      <div className="hidden lg:block absolute top-24 right-12 rotate-[-8deg]">
        <div className="text-leaf font-serif italic text-lg leading-tight opacity-70">
          Your next<br />favourite<br />store is here
        </div>
        <div className="text-leaf/40 text-2xl mt-1">♡</div>
      </div>
    </section>
  )
}