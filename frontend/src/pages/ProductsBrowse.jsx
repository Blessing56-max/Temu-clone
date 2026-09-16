import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { X, Package, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchProducts, fetchCategories } from '@/store/slices/catalogSlice'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/ui/EmptyState'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'

export default function ProductsBrowse() {
  const dispatch = useDispatch()
  const { products, productsLoading, totalProducts, currentPage, totalPages } = useSelector((s) => s.catalog)
  const categories = useSelector((s) => s.catalog.categories)
  const [params, setParams] = useSearchParams()

  const q = params.get('q') || ''
  const categoryName = params.get('category')
  const page = Number(params.get('page') || 0)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const cat = categoryName ? categories.find((c) => c.name === categoryName) : null
    dispatch(fetchProducts({
      q,
      categoryId: cat ? cat.id : null,
      page,
      size: 24,
    }))
  }, [dispatch, q, categoryName, page, categories.length])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12">
        <h1 className="font-display text-3xl font-semibold mb-1">Browse products</h1>
        <p className="text-onLight/50 text-sm mb-6">
          {productsLoading ? 'Loading...' : `${totalProducts.toLocaleString()} product${totalProducts !== 1 ? 's' : ''} on Kora`}
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => updateParam('category', '')}
            className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${
              !categoryName ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.name)}
              className={`text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${
                categoryName === c.name ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {categoryName && (
          <button
            onClick={() => updateParam('category', '')}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-leaf/10 text-leaf-dim rounded-full px-3 py-1.5 mb-6 hover:bg-leaf/15"
          >
            {categoryName} <X size={12} />
          </button>
        )}

        {productsLoading ? (
          <ProductGridSkeleton count={9} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nothing here yet"
            description={q ? `We couldn't find anything matching "${q}".` : 'No products in this category yet.'}
            actionLabel="Browse everything"
            actionTo="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} isAuthed={false} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => updateParam('page', String(Math.max(0, currentPage - 1)))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-full border border-onLight/15 text-sm disabled:opacity-40 hover:border-leaf transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-onLight/50 px-4">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => updateParam('page', String(Math.min(totalPages - 1, currentPage + 1)))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 rounded-full border border-onLight/15 text-sm disabled:opacity-40 hover:border-leaf transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}