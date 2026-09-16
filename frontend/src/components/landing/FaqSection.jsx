import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import Reveal from '@/components/Reveal'

const faqs = [
  {
    q: 'How does Kora verify sellers?',
    a: 'Every vendor submits identity documents (NIN, passport, or driver\'s licence) plus optional business registration. Our team reviews each application before the first product goes live — approval is not automatic.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Kora uses Stripe for card payments. Your card details never touch our servers — Stripe handles them directly. We\'re adding bank transfer and USSD next.',
  },
  {
    q: 'How do I track my order?',
    a: 'Every order has a live timeline showing the exact moment it was placed, paid, packed, shipped, and delivered — with timestamps and who updated each step. You\'ll get a notification at each stage.',
  },
  {
    q: 'Can I return a product?',
    a: 'Yes — Kora has a 7-day return window on most items, starting from when the order is marked Delivered. Some categories (opened beauty products, perishables) are exempt.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Register a normal account, then apply to sell through your dashboard. You\'ll fill in a short eligibility form and upload ID. Once verified, listing tools unlock.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-paper py-28">
      <div className="container-page">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
          <Reveal direction="left">
            <span className="text-sm font-medium text-leaf-dim">Questions</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 leading-tight">
              Things people ask us
            </h2>
            <p className="text-onLight/55 mt-4 text-sm leading-relaxed max-w-xs">
              Still curious? Reach out at hello@kora.market — real humans reply.
            </p>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <div className="flex flex-col">
              {faqs.map((f, i) => {
                const isOpen = open === i
                return (
                  <div
                    key={f.q}
                    className="border-b border-onLight/10 last:border-b-0"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                    >
                      <span className={`font-medium transition-colors ${isOpen ? 'text-leaf-dim' : 'text-onLight group-hover:text-leaf-dim'}`}>
                        {f.q}
                      </span>
                      <span className={`shrink-0 size-8 rounded-full flex items-center justify-center border transition-colors ${isOpen ? 'border-leaf text-leaf bg-leaf/10' : 'border-onLight/15 text-onLight/50'}`}>
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-onLight/60 leading-relaxed pb-6 pr-12">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}