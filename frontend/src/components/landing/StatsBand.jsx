import { motion } from 'framer-motion'
import Reveal from '@/components/Reveal'
import { ShoppingBag, Store, MapPin, Star } from 'lucide-react'

const stats = [
  { icon: Store, value: '480+', label: 'Verified vendors' },
  { icon: ShoppingBag, value: '32,000+', label: 'Active shoppers' },
  { icon: MapPin, value: '15', label: 'Cities covered' },
  { icon: Star, value: '4.8', label: 'Avg. product rating' },
]

export default function StatsBand() {
  return (
    <section className="bg-canopy py-16 relative overflow-hidden">
      <div className="absolute inset-0 market-grid opacity-40" aria-hidden="true" />
      <div className="container-page relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center md:text-left">
              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-col items-center md:items-start gap-3"
              >
                <div className="size-11 rounded-full bg-leaf/15 border border-leaf/25 flex items-center justify-center">
                  <s.icon size={18} className="text-leaf" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-display text-3xl md:text-4xl font-semibold text-onDark tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs text-onDark/50 mt-1 uppercase tracking-wide">
                    {s.label}
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