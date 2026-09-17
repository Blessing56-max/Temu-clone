import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, Package, Eye } from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import ProductThumb from '@/components/ProductThumb'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

export default function SellerProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const r = await api.get('/seller/products?size=100')
      setProducts(r.content || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function deleteProduct(id) {
    if (!confirm('Remove this product from your storefront?\n\nIt will be hidden from buyers but past orders still keep their record.')) return
    try { await api.delete(`/products/${id}`); load() }
    catch (e) { alert(e.message) }
  }

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your products</h1>
          <p className="text-sm text-onLight/50 mt-1">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} listed`}
          </p>
        </div>
        <Link to="/vendor/products/new">
          <Button><Plus size={15} /> Add product</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-onLight/10 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-onLight/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-onLight/5 rounded w-3/4" />
                <div className="h-3 bg-onLight/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start selling on Kora."
          actionLabel="Add product"
          actionTo="/vendor/products/new"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border border-onLight/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-square relative">
                <ProductThumb product={p} />
                {!p.active && (
                  <div className="absolute inset-0 bg-paper/70 backdrop-blur-[2px] flex items-center justify-center text-xs font-semibold">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                <div className="text-xs text-onLight/45 mt-1">{p.categoryName || '—'}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold text-sm">
                    &#8358;{Number(p.discountPrice || p.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-onLight/50">Stock: {p.stock}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-onLight/8">
                  <Link to={`/products/${p.id}`} className="flex-1">
                    <button className="w-full text-xs font-medium text-onLight/60 hover:text-leaf flex items-center justify-center gap-1 py-1.5">
                      <Eye size={12} /> View
                    </button>
                  </Link>
                  <Link to={`/vendor/products/${p.id}/edit`} className="flex-1">
                    <button className="w-full text-xs font-medium text-onLight/60 hover:text-leaf flex items-center justify-center gap-1 py-1.5">
                      <Edit3 size={12} /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="flex-1 text-xs font-medium text-onLight/60 hover:text-coral flex items-center justify-center gap-1 py-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SellerLayout>
  )
}