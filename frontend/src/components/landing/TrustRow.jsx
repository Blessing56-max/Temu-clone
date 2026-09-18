import { Truck, ShieldCheck, RotateCcw, Headphones, Zap } from 'lucide-react'

const ITEMS = [
  { icon: Truck, title: 'Free Shipping', sub: 'On all orders' },
  { icon: ShieldCheck, title: 'Secure Payment', sub: '100% safe & trusted' },
  { icon: RotateCcw, title: 'Easy Returns', sub: 'Within 14 days' },
  { icon: Headphones, title: '24/7 Support', sub: "We're here to help" },
  { icon: Zap, title: 'Daily Deals', sub: 'Up to 70% off' },
]

export default function TrustRow() {
  return (
    <section className="bg-paper py-6 border-y border-onLight/8">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-leaf/10 flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-leaf-dim" strokeWidth={2} />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-xs font-semibold text-onLight truncate">{item.title}</div>
                <div className="text-[10px] text-onLight/50 truncate">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}