import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function SectionHeading({ eyebrow, title, subtitle, viewAllTo, viewAllLabel = 'View All' }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <span className="text-xs font-semibold text-leaf-dim uppercase tracking-wide">{eyebrow}</span>}
        <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-onLight mt-1 leading-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs md:text-sm text-onLight/55 mt-1">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-xs md:text-sm font-medium text-leaf-dim hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          {viewAllLabel} <ArrowRight size={12} />
        </Link>
      )}
    </Reveal>
  )
}