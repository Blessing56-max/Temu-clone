import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductThumb from '@/components/ProductThumb'

const SIZE = 320

export default function ProductCubeSlider({ products = [] }) {
  const items = products.slice(0, 4)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (paused || items.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000)
    return () => clearInterval(id)
  }, [paused, items.length])

  if (items.length === 0) return null

  const angleStep = 360 / items.length

  return (
    <div
      className="flex flex-col items-center gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ perspective: '1200px', width: SIZE, height: SIZE }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            width: SIZE,
            height: SIZE,
            position: 'relative',
          }}
          animate={{ rotateY: -index * angleStep }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          {items.map((product, i) => (
            <button
              key={product.id}
              onClick={() => navigate('/products/' + product.id)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: SIZE,
                height: SIZE,
                transform: 'rotateY(' + (i * angleStep) + 'deg) translateZ(' + (SIZE / 2) + 'px)',
                backfaceVisibility: 'hidden',
              }}
              className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-onLight/10 cursor-pointer text-left"
            >
              <ProductThumb product={product} iconSize={48} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent p-5 text-onDark">
                <div className="font-display font-semibold text-base line-clamp-2 leading-tight">
                  {product.name}
                </div>
                <div className="text-leaf font-bold mt-1 text-sm">
                  N{Number(product.discountPrice || product.price).toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      <div className="flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={'h-1.5 rounded-full transition-all ' + (i === index ? 'w-8 bg-leaf' : 'w-1.5 bg-onLight/20 hover:bg-onLight/40')}
            aria-label={'Show product ' + (i + 1)}
          />
        ))}
      </div>
    </div>
  )
}