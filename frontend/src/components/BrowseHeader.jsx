import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function BrowseHeader({ categoryName, searchQuery, totalProducts }) {
  const title = searchQuery
    ? 'Results for "' + searchQuery + '"'
    : categoryName || 'All Products'

  return (
    <div className="bg-gradient-to-br from-canopy to-ink text-onDark">
      <div className="container-page py-8 md:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-onDark/50 mb-4">
          <Link to="/" className="hover:text-leaf flex items-center gap-1">
            <Home size={11} /> Home
          </Link>
          <ChevronRight size={11} />
          <span className="text-onDark/80">{categoryName || 'Products'}</span>
        </nav>

        <h1 className="font-display text-2xl md:text-4xl font-bold leading-tight">
          {title}
        </h1>
        <p className="text-onDark/60 text-sm mt-2">
          {totalProducts.toLocaleString()} product{totalProducts !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  )
}