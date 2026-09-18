import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function MarketplaceSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate('/products?q=' + encodeURIComponent(query.trim()))
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, and categories..."
          className="w-full h-14 md:h-16 pl-14 pr-32 rounded-full bg-white border-2 border-leaf/30 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10 transition-all shadow-lg shadow-leaf/5"
        />
        <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-onLight/40" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 md:h-12 px-6 rounded-full bg-leaf text-onDark font-medium hover:bg-leaf-dim transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}