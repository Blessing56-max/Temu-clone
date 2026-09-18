import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '@/store/slices/catalogSlice'
import { Layers } from 'lucide-react'

export default function CategoryStrip() {
  const dispatch = useDispatch()
  const categories = useSelector((s) => s.catalog.categories)

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  return (
    <div className="bg-white border-b border-onLight/8 sticky top-16 z-30">
      <div className="container-page">
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-thin">
          <Link
            to="/products"
            className="shrink-0 flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-ink text-onDark hover:bg-canopy transition-colors"
          >
            <Layers size={14} />
            All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={'/products?category=' + encodeURIComponent(c.name)}
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-full bg-onLight/5 text-onLight/70 hover:bg-leaf/10 hover:text-leaf-dim transition-colors whitespace-nowrap"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}