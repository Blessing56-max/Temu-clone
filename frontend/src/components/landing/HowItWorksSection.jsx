import { motion } from 'framer-motion'
import { Search, ShieldCheck, MessageSquare, Truck } from 'lucide-react'
import Reveal from '@/components/Reveal'

const STEPS = [
  {
    n: '01',
    icon: Search,
    title: 'Find something worth buying',
    body: 'Browse a feed shaped by real listings from verified sellers — not by who paid for placement.',
  },
  {
    n: '02',
    icon: ShieldCheck,
    title: 'Buy straight from the maker',
    body: 'Every vendor is identity-verified before their first listing goes live. No surprises.',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Track it end to end',
    body: 'A live timeline shows the exact moment your order was placed, packed, shipped, and delivered.',
  },
  {
    n: '04',
    icon: MessageSquare,
    title: 'Say how it went',
    body: 'Rate the product — and separately, the vendor. Delivery and communication included.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-paper py-28">
      <div className="container-page">
        <Reveal className="mb-16 max-w-lg">
          <span className="text-sm font-medium text-leaf-dim">How Kora works</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 leading-tight">
            Four steps. No noise.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative h-full bg-white border border-onLight/10 rounded-3xl p-6 overflow-hidden"
              >
                <span className="absolute -top-4 -right-2 font-display text-8xl font-bold text-leaf/8 leading-none select-none">
                  {step.n}
                </span>

                <div className="relative">
                  <div className="size-12 rounded-2xl bg-leaf/10 flex items-center justify-center mb-5">
                    <step.icon size={22} className="text-leaf-dim" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-base mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-onLight/55 leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}