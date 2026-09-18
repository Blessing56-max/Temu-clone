import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'

const SORTS = [
  { id: 'default', label: 'Recommended' },
  { id: 'price-asc', label: 'Cheapest first' },
  { id: 'price-desc', label: 'Most expensive' },
  { id: 'rating', label: 'Top rated' },
  { id: 'new', label: 'Newest' },
]

const PRICE_BANDS = [
  { id: 'all', label: 'Any price', min: null, max: null },
  { id: 'under-10k', label: 'Under N10,000', min: 0, max: 10000 },
  { id: '10-50k', label: 'N10,000 - N50,000', min: 10000, max: 50000 },
  { id: '50-100k', label: 'N50,000 - N100,000', min: 50000, max: 100000 },
  { id: 'over-100k', label: 'Over N100,000', min: 100000, max: null },
]

export default function FilterBar({ sort, onSortChange, priceBand, onPriceBandChange, activeFilters, onClearFilters }) {
  const [sortOpen, setSortOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)

  const currentSort = SORTS.find((s) => s.id === sort) || SORTS[0]
  const currentPrice = PRICE_BANDS.find((p) => p.id === priceBand) || PRICE_BANDS[0]
  const hasFilters = activeFilters && activeFilters.length > 0

  return (
    <div className="bg-white border-b border-onLight/8 sticky top-16 z-20">
      <div className="container-page py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => { setSortOpen((o) => !o); setPriceOpen(false) }}
              className="flex items-center gap-2 text-xs md:text-sm font-medium bg-onLight/5 hover:bg-onLight/10 rounded-full px-4 py-2 transition-colors"
            >
              <SlidersHorizontal size={13} />
              {currentSort.label}
              <ChevronDown size={13} className={'transition-transform ' + (sortOpen ? 'rotate-180' : '')} />
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-onLight/10 rounded-xl shadow-lg overflow-hidden z-30">
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onSortChange(s.id); setSortOpen(false) }}
                    className={'w-full text-left text-xs md:text-sm px-4 py-2.5 transition-colors ' + (sort === s.id ? 'bg-leaf/10 text-leaf-dim font-medium' : 'text-onLight/70 hover:bg-onLight/5')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price dropdown */}
          <div className="relative">
            <button
              onClick={() => { setPriceOpen((o) => !o); setSortOpen(false) }}
              className="flex items-center gap-2 text-xs md:text-sm font-medium bg-onLight/5 hover:bg-onLight/10 rounded-full px-4 py-2 transition-colors"
            >
              {currentPrice.label}
              <ChevronDown size={13} className={'transition-transform ' + (priceOpen ? 'rotate-180' : '')} />
            </button>
            {priceOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-onLight/10 rounded-xl shadow-lg overflow-hidden z-30">
                {PRICE_BANDS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onPriceBandChange(p.id); setPriceOpen(false) }}
                    className={'w-full text-left text-xs md:text-sm px-4 py-2.5 transition-colors ' + (priceBand === p.id ? 'bg-leaf/10 text-leaf-dim font-medium' : 'text-onLight/70 hover:bg-onLight/5')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-coral bg-coral/10 hover:bg-coral/15 rounded-full px-3.5 py-2 transition-colors ml-auto"
            >
              Clear filters <X size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}