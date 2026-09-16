import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion'
import ProductThumb from '@/components/ProductThumb'
import { discountPercent } from '@/components/PriceTag'

const RADIUS = 210
const DEG_PER_SEC = 22
const SLOWED_DEG_PER_SEC = 8
const MAX_ITEMS = 6

function RingCard({ product, baseAngle, ringRotation, onClick }) {
  const [hovered, setHovered] = useState(false)

  const worldAngle = useTransform(ringRotation, (r) => ((baseAngle + r) % 360 + 360) % 360)
  const nearness = useTransform(worldAngle, (a) => (Math.cos((a * Math.PI) / 180) + 1) / 2)
  const scale = useTransform(nearness, [0, 1], [0.78, 1.05])
  const opacity = useTransform(nearness, [0, 1], [0.4, 1])

  const pct = discountPercent(product)

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: 220,
        height: 408,
        marginLeft: -110,
        marginTop: -204,
        transform: `rotateY(${baseAngle}deg) translateZ(${RADIUS}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div style={{ scale, opacity, transformStyle: 'preserve-3d' }} className="w-full h-full">
        <motion.button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative w-full h-full rounded-2xl overflow-hidden bg-white border border-onLight/10 text-left cursor-pointer"
          style={{
            boxShadow: hovered
              ? '0 24px 60px -12px rgba(63,191,107,0.5), 0 0 0 1.5px rgba(63,191,107,0.7)'
              : '0 12px 30px -12px rgba(19,26,21,0.2)',
          }}
        >
          <ProductThumb product={product} iconSize={26} />
          {pct && (
            <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-coral rounded-md px-1.5 py-0.5">
              -{pct}%
            </span>
          )}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm px-3 py-2.5"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="text-[11px] font-medium leading-tight truncate">{product.name}</div>
            <div className="text-[11px] font-semibold text-leaf-dim mt-0.5">
              &#8358;{Number(product.discountPrice || product.price).toLocaleString()}
            </div>
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default function ProductGlobeCarousel({ products = [], className = '' }) {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const wrapperRef = useRef(null)

  const items = useMemo(() => (products || []).slice(0, MAX_ITEMS), [products])
  const angleStep = items.length > 0 ? 360 / items.length : 0

  const rotation = useMotionValue(0)
  const smoothRotation = useSpring(rotation, { stiffness: 60, damping: 18 })

  useAnimationFrame((_, delta) => {
    if (reduceMotion || items.length === 0) return
    const speed = paused ? SLOWED_DEG_PER_SEC : DEG_PER_SEC
    rotation.set(rotation.get() + (delta / 1000) * speed)
  })

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const smoothTiltX = useSpring(tiltX, { stiffness: 120, damping: 20 })
  const smoothTiltY = useSpring(tiltY, { stiffness: 120, damping: 20 })

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || reduceMotion) return
    const handle = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / Math.max(rect.width, 1)
      const dy = (e.clientY - cy) / Math.max(rect.height, 1)
      tiltY.set(Math.max(-14, Math.min(14, dx * 18)))
      tiltX.set(Math.max(-10, Math.min(10, -dy * 14)))
    }
    const leave = () => { tiltX.set(0); tiltY.set(0) }
    window.addEventListener('mousemove', handle)
    window.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', handle)
      window.removeEventListener('mouseleave', leave)
    }
  }, [reduceMotion, tiltX, tiltY])

  if (items.length === 0) return null

  return (
    <motion.div
      ref={wrapperRef}
      initial={reduceMotion ? false : { opacity: 0, x: 90 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${className}`}
      style={{ perspective: '1500px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <motion.div
          className="w-[480px] h-[480px] rounded-full bg-leaf/20 blur-[120px]"
          animate={reduceMotion ? {} : { opacity: [0.55, 1, 0.55], scale: [0.95, 1.06, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        animate={reduceMotion ? {} : { y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="relative mx-auto"
          style={{
            width: RADIUS * 2,
            height: RADIUS * 2.05,
            transformStyle: 'preserve-3d',
            rotateX: smoothTiltX,
            rotateY: smoothTiltY,
          }}
        >
          <motion.div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              rotateY: smoothRotation,
              willChange: 'transform',
            }}
          >
            {items.map((product, i) => (
              <RingCard
                key={product.id}
                product={product}
                baseAngle={i * angleStep}
                ringRotation={smoothRotation}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-24 rounded-full bg-leaf/20 blur-3xl pointer-events-none"
        animate={reduceMotion ? {} : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}