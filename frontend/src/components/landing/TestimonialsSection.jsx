import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import Reveal from '@/components/Reveal'

const TESTIMONIALS = [
  {
    quote: 'Found a leather tote I still get compliments on, from a vendor I\'d never have discovered anywhere else.',
    author: 'Ijeoma A.',
    role: 'Customer since 2025',
    initials: 'IA',
  },
  {
    quote: 'Applied on a Tuesday, verified by Thursday. Didn\'t expect a marketplace to move that fast.',
    author: 'Kunle O.',
    role: 'Vendor, Everstock Electronics',
    initials: 'KO',
  },
  {
    quote: 'The tracking actually works. I knew exactly when my package shipped and who shipped it.',
    author: 'Chiamaka N.',
    role: 'Customer since 2026',
    initials: 'CN',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-28 relative overflow-hidden">
      <div className="container-page">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-medium text-leaf-dim">What people say</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 leading-tight">
            Real buyers. Real sellers.
          </h2>
          <p className="text-onLight/55 mt-4">
            Kora is built around trust — verified vendors, honest tracking, and a feed that respects your time.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative h-full bg-paper border border-onLight/10 rounded-3xl p-7 flex flex-col"
              >
                <Quote size={28} className="text-leaf/35 mb-5" strokeWidth={1.5} />

                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className="fill-amber text-amber" />
                  ))}
                </div>

                <p className="text-onLight/75 leading-relaxed flex-1">"{t.quote}"</p>

                <div className="flex items-center gap-3 mt-7 pt-6 border-t border-onLight/8">
                  <div className="size-10 rounded-full bg-leaf/15 flex items-center justify-center font-display font-semibold text-sm text-leaf-dim">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.author}</div>
                    <div className="text-xs text-onLight/45 mt-0.5">{t.role}</div>
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