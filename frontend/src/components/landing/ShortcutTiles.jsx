import { Link } from 'react-router-dom'
import { Zap, Truck, Star, Wallet, ArrowRight } from 'lucide-react'

const TILES = [
  {
    to: '/products',
    label: 'Flash Deals',
    sub: 'Up to 40% off',
    icon: Zap,
    bg: 'bg-coral/10',
    text: 'text-coral',
    hover: 'hover:bg-coral/20',
  },
  {
    to: '/products',
    label: 'Free Delivery',
    sub: 'Orders over N50k',
    icon: Truck,
    bg: 'bg-leaf/10',
    text: 'text-leaf-dim',
    hover: 'hover:bg-leaf/20',
  },
  {
    to: '/products',
    label: 'Top Rated',
    sub: '4.5+ stars',
    icon: Star,
    bg: 'bg-amber/10',
    text: 'text-amber',
    hover: 'hover:bg-amber/20',
  },
  {
    to: '/products',
    label: 'Budget Picks',
    sub: 'Under N10k',
    icon: Wallet,
    bg: 'bg-canopy/10',
    text: 'text-canopy',
    hover: 'hover:bg-canopy/20',
  },
]

export default function ShortcutTiles() {
  return (
    <section className="bg-paper py-8 md:py-10">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {TILES.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              className={'group rounded-2xl border border-onLight/8 p-4 md:p-5 flex items-center gap-3 transition-all hover:-translate-y-0.5 ' + t.bg + ' ' + t.hover}
            >
              <div className={'size-10 md:size-12 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center shrink-0 ' + t.text}>
                <t.icon size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-onLight truncate">{t.label}</div>
                <div className="text-xs text-onLight/55 truncate mt-0.5">{t.sub}</div>
              </div>
              <ArrowRight size={14} className={'shrink-0 transition-transform group-hover:translate-x-1 ' + t.text} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}