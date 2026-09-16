import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'

export default function ProductCard({ product, onAdd, isAuthed = true, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-onLight/10 rounded-2xl overflow-hidden flex flex-col"
    >
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-paper">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <ProductThumb product={product} iconSize={34} />
        </div>
        {product.stock === 0 && (
          <span className="absolute inset-0 bg-paper/70 backdrop-blur-[2px] flex items-center justify-center text-xs font-semibold text-onLight/70">
            Out of stock
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link
          to={`/products/${product.id}`}
          className="font-medium text-sm hover:text-leaf-dim line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>
        <div className="text-xs text-onLight/45 mt-1 truncate">
          {product.sellerName}
        </div>

        <div className="flex items-end justify-between mt-auto pt-3 gap-2">
          <PriceTag product={product} />
          {isAuthed && onAdd && product.stock > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product) }}
              className="shrink-0 size-8 rounded-full bg-ink text-onDark hover:bg-leaf transition-colors flex items-center justify-center"
              aria-label="Add to cart"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}