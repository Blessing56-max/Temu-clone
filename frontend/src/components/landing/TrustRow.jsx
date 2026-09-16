import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import Reveal from '@/components/Reveal'

const ITEMS = [
  { icon: Truck, title: 'Fast delivery', sub: '3-5 day shipping across Nigeria' },
  { icon: ShieldCheck, title: 'Verified sellers', sub: 'ID-checked before listing' },
  { icon: RotateCcw, title: 'Easy returns', sub: '7-day return window' },
  { icon: Headphones, title: 'Real support', sub: 'Humans answer, fast' },
]

export default function TrustRow() {
  return (
    <section className="bg-white border-y border-onLight/8">
      <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05} className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-leaf/10 flex items-center justify-center shrink-0">
              <item.icon size={17} className="text-leaf-dim" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-sm font-medium leading-tight">{item.title}</div>
              <div className="text-xs text-onLight/45 leading-snug mt-1">{item.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}