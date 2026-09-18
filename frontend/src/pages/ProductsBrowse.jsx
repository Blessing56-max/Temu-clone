import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrowseHeader from '@/components/BrowseHeader'
import FilterBar from '@/components/FilterBar'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/ui/EmptyState'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { fetchProducts, fetchCategories, addToCartApi } from '@/store/slices/catalogSlice'

const PRICE_MAP = {
  'all': [null, null],
  'under-10k': [0, 10000],
  '10-50k': [10000, 50000],
  '50-100k': [50000, 100000],
  'over-100k': [100000, null],
}

export default function ProductsBrowse() {
  const dispatch = useDispatch()
  const { products, productsLoading, totalProducts, totalPages, currentPage } = useSelector((s) => s.catalog)
  const categories = useSelector((s) => s.catalog.categories)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [params, setParams] = useSearchParams()

  const q = params.get('q') || ''
  const categoryName = params.get('category')
  const page = Number(params.get('page') || 0)
  const [sort, setSort] = useState('default')
  const toast = useToast()
  const [priceBand, setPriceBand] = useState('all')

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const cat = categoryName ? categories.find((c) => c.name === categoryName) : null
    const [minPrice, maxPrice] = PRICE_MAP[priceBand] || [null, null]
    dispatch(fetchProducts({
      q,
      categoryId: cat ? cat.id : null,
      minPrice,
      maxPrice,
      page,
      size: 24,
    }))
  }, [dispatch, q, categoryName, page, priceBand, categories.length])

  // Client-side sort on top of API response
  const displayed = useMemo(() => {
    const copy = [...products]
    if (sort === 'price-asc') copy.sort((a, b) => Number(a.discountPrice || a.price) - Number(b.discountPrice || b.price))
    if (sort === 'price-desc') copy.sort((a, b) => Number(b.discountPrice || b.price) - Number(a.discountPrice || a.price))
    if (sort === 'rating') copy.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    if (sort === 'new') copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return copy
  }, [products, sort])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  function clearAll() {
    setParams(new URLSearchParams())
    setSort('default')
    setPriceBand('all')
  }

  async function add(p) {
    if (!isAuthed) {
      toast.push({ type: 'error', title: 'Log in to add items', description: 'Create an account or sign in.' })
      return
    }
    const action = await dispatch(addToCartApi({ productId: p.id, quantity: 1 }))
    if (addToCartApi.fulfilled.match(action)) {
      toast.push({ type: 'success', title: 'Added to cart', description: p.name })
    } else {
      toast.push({ type: 'error', title: 'Could not add item', description: action.payload || 'Try again.' })
    }
  }

  const activeFilters = [q, categoryName, priceBand !== 'all' ? priceBand : null].filter(Boolean)

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <BrowseHeader
        categoryName={categoryName}
        searchQuery={q}
        totalProducts={totalProducts}
      />
      <FilterBar
        sort={sort}
        onSortChange={setSort}
        priceBand={priceBand}
        onPriceBandChange={setPriceBand}
        activeFilters={activeFilters}
        onClearFilters={clearAll}
      />

      <div className="container-page py-8">
        {productsLoading ? (
          <ProductGridSkeleton count={12} />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nothing found"
            description={q ? 'We could not find anything matching "' + q + '".' : 'No products in this category yet.'}
            actionLabel="Browse everything"
            actionTo="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayed.map((p, i) => (
                <ProductCard key={p.id} product={p} onAdd={add} isAuthed={isAuthed} index={i} />
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