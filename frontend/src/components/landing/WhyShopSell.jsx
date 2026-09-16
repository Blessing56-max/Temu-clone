import { Check } from 'lucide-react'
import Reveal from '@/components/Reveal'

const FOR_SHOPPERS = [
  'Personalized feed from day one',
  'Every vendor manually verified',
  'Track orders every step of the way',
  'Rate the product AND the vendor',
]

const FOR_SELLERS = [
  'Fast, transparent application review',
  'Your own shop dashboard',
  'Real sales analytics and product views',
  'Notification the moment you get an order',
]

export default function WhyShopSell() {
  return (
    <section className="bg-paper py-28">
      <div className="container-page grid md:grid-cols-2 gap-6">
        <Reveal direction="left">
          <div className="h-full bg-white border border-onLight/10 rounded-3xl p-8 md:p-10">
            <span className="text-sm font-medium text-leaf-dim">For customers</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 mb-8 leading-tight">
              Why shop with us
            </h2>
            <ul className="space-y-4">
              {FOR_SHOPPERS.map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <span className="size-5 rounded-full bg-leaf/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-leaf-dim" strokeWidth={3} />
                  </span>
                  <span className="text-onLight/75 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal direction="right" delay={0.1}>
          <div className="h-full bg-canopy text-onDark rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 market-grid opacity-25" aria-hidden="true" />
            <div className="relative">
              <span className="text-sm font-medium text-leaf">For sellers</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 mb-8 leading-tight">
                Why sell with us
              </h2>
              <ul className="space-y-4">
                {FOR_SELLERS.map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="size-5 rounded-full bg-leaf/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-leaf" strokeWidth={3} />
                    </span>
                    <span className="text-onDark/80 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}