import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Reveal from '@/components/Reveal'
import { fetchCategories } from '@/store/slices/catalogSlice'

const CATEGORY_IMAGES = {
  'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'Beauty & Health': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  'Sports & Outdoors': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'Books & Stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  'Toys & Games': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80',
  'Groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'

export default function CategoryGrid() {
  const dispatch = useDispatch()
  const categories = useSelector((s) => s.catalog.categories)

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  if (categories.length === 0) {
    return (
      <section className="bg-white py-24 border-t border-onLight/8">
        <div className="container-page">
          <div className="mb-10 h-10 w-64 bg-onLight/5 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[5/4] rounded-3xl bg-onLight/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-24 border-t border-onLight/8">
      <div className="container-page">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-leaf-dim">Explore</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Shop by category</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline flex items-center gap-1">
            All products <ArrowRight size={14} />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.05}>
              <Link to={'/products?category=' + encodeURIComponent(cat.name)}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative rounded-3xl aspect-[5/4] overflow-hidden group"
                >
                  <img
                    src={CATEGORY_IMAGES[cat.name] || FALLBACK_IMG}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
                  />

                  {/* Subtle top gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* SOLID DARK BAND at the bottom — text sits on this, always readable */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-md px-5 pt-5 pb-4">
                    <div className="text-leaf-dim font-bold text-base md:text-lg leading-tight tracking-tight">
                      {cat.name}
                    </div>
                    <div className="text-leaf text-xs mt-1.5 flex items-center gap-1.5 font-bold tracking-wide uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                      Shop now
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}