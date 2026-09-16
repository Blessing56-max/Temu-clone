import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Package, BadgeCheck } from 'lucide-react'
import Reveal from '@/components/Reveal'

const sellers = [
  {
    name: 'Field & Form',
    tagline: 'Everyday fashion, made to last.',
    initials: 'FF',
    tint: 'bg-leaf/15 text-leaf-dim',
    products: 42,
    rating: 4.8,
    category: 'Fashion',
  },
  {
    name: 'Everstock Electronics',
    tagline: 'Gear that actually works.',
    initials: 'EV',
    tint: 'bg-canopy/12 text-canopy',
    products: 87,
    rating: 4.7,
    category: 'Electronics',
  },
  {
    name: 'Kiln & Co.',
    tagline: 'Hand-thrown ceramics for slow mornings.',
    initials: 'KC',
    tint: 'bg-amber/15 text-amber',
    products: 26,
    rating: 4.9,
    category: 'Home',
  },
]

export default function SellerSpotlight() {
  return (
    <section className="bg-white py-24">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium text-leaf-dim">Meet the makers</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">
              Sellers worth following
            </h2>
            <p className="text-onLight/55 mt-3 max-w-lg">
              Every vendor on Kora is identity-verified before their first listing goes live.
            </p>
          </div>
          <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline">
            Browse all sellers →
          </Link>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {sellers.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="relative h-full bg-paper border border-onLight/10 rounded-3xl p-7 overflow-hidden group"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-leaf/8 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`size-14 rounded-2xl flex items-center justify-center font-display font-semibold text-lg ${s.tint}`}>
                      {s.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold">{s.name}</h3>
                        <BadgeCheck size={15} className="text-leaf" />
                      </div>
                      <div className="text-xs text-onLight/45 mt-0.5">{s.category}</div>
                    </div>
                  </div>

                  <p className="text-sm text-onLight/65 leading-relaxed min-h-[40px]">{s.tagline}</p>

                  <div className="flex items-center gap-5 mt-6 pt-5 border-t border-onLight/8">
                    <div className="flex items-center gap-1.5">
                      <Package size={14} className="text-onLight/40" />
                      <span className="text-xs text-onLight/60">{s.products} products</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="fill-amber text-amber" />
                      <span className="text-xs text-onLight/60">{s.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}