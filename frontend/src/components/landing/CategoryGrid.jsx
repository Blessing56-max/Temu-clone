import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  Smartphone, Shirt, Home, Sparkles, Dumbbell,
  BookOpen, Gamepad2, ShoppingBasket, Package, LayoutGrid
} from 'lucide-react'
import Reveal from '@/components/Reveal'
import { fetchCategories } from '@/store/slices/catalogSlice'

const TINTS = [
  { bg: 'bg-[#FFE4E1]', icon: 'text-[#D4534A]' },
  { bg: 'bg-[#E0F2FE]', icon: 'text-[#0369A1]' },
  { bg: 'bg-[#FEF3C7]', icon: 'text-[#B45309]' },
  { bg: 'bg-[#FCE7F3]', icon: 'text-[#BE185D]' },
  { bg: 'bg-[#DBEAFE]', icon: 'text-[#1E40AF]' },
  { bg: 'bg-[#D1FAE5]', icon: 'text-[#047857]' },
  { bg: 'bg-[#FEE2E2]', icon: 'text-[#B91C1C]' },
  { bg: 'bg-[#EDE9FE]', icon: 'text-[#6D28D9]' },
]

const CATEGORY_ICONS = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Home & Kitchen': Home,
  'Beauty & Health': Sparkles,
  'Sports & Outdoors': Dumbbell,
  'Books & Stationery': BookOpen,
  'Toys & Games': Gamepad2,
  'Groceries': ShoppingBasket,
}

export default function CategoryGrid() {
  const dispatch = useDispatch()
  const categories = useSelector((s) => s.catalog.categories)

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  if (categories.length === 0) {
    return (
      <section className="bg-white py-16 border-t border-onLight/8">
        <div className="container-page">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="size-20 rounded-full bg-onLight/5 animate-pulse" />
                <div className="h-3 w-16 bg-onLight/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-14 md:py-16 border-t border-onLight/8">
      <div className="container-page">
        <Reveal className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-medium text-leaf-dim">Browse categories</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mt-1">
              Shop by Category
            </h2>
            <p className="text-sm text-onLight/55 mt-1">Find what you love, all in one place.</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline flex items-center gap-1 whitespace-nowrap">
            View all
          </Link>
        </Reveal>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const tint = TINTS[i % TINTS.length]
            const Icon = CATEGORY_ICONS[cat.name] || Package
            return (
              <Reveal key={cat.id} delay={i * 0.04}>
                <Link to={'/products?category=' + encodeURIComponent(cat.name)}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={'size-16 md:size-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ' + tint.bg}>
                      <Icon size={28} className={tint.icon} strokeWidth={1.75} />
                    </div>
                    <span className="text-xs md:text-sm text-onLight/80 text-center font-medium leading-tight group-hover:text-leaf-dim">
                      {cat.name.replace(' & ', ' ').replace('Home Kitchen', 'Home').replace('Beauty Health', 'Beauty').replace('Sports Outdoors', 'Sports').replace('Books Stationery', 'Books').replace('Toys Games', 'Toys')}
                    </span>
                  </motion.div>
                </Link>
              </Reveal>
            )
          })}

          <Reveal delay={0.4}>
            <Link to="/products">
              <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center gap-3 group">
                <div className="size-16 md:size-20 rounded-full flex items-center justify-center bg-ink text-onDark transition-transform group-hover:scale-105">
                  <LayoutGrid size={28} strokeWidth={1.75} />
                </div>
                <span className="text-xs md:text-sm text-onLight/80 font-medium group-hover:text-leaf-dim">
                  More
                </span>
              </motion.div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}