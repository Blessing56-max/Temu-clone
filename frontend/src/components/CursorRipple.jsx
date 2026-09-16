import { useEffect, useRef } from 'react'

/**
 * Canvas-based ripple that spawns soft expanding rings wherever the cursor moves.
 * Uses a single requestAnimationFrame loop, caps live ripples to keep it cheap,
 * and bails out entirely under prefers-reduced-motion.
 */
export default function CursorRipple({ color = '63,191,107', maxRipples = 14 }) {
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])
  const mouseRef = useRef({ x: -1, y: -1 })
  const lastSpawnRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handleLeave = () => { mouseRef.current = { x: -1, y: -1 } }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = performance.now()

      // Spawn a new ripple roughly every 110ms while the cursor is on the page
      if (mouseRef.current.x > 0 && now - lastSpawnRef.current > 110) {
        lastSpawnRef.current = now
        ripplesRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          born: now,
        })
        if (ripplesRef.current.length > maxRipples) ripplesRef.current.shift()
      }

      ripplesRef.current = ripplesRef.current.filter((rp) => (now - rp.born) < 1600)

      for (const rp of ripplesRef.current) {
        const age = (now - rp.born) / 1000
        const r = age * 160
        const life = Math.max(0, 1 - age / 1.6)

        const gradient = ctx.createRadialGradient(rp.x, rp.y, r * 0.75, rp.x, rp.y, r)
        gradient.addColorStop(0, `rgba(${color}, 0)`)
        gradient.addColorStop(0.6, `rgba(${color}, ${0.18 * life})`)
        gradient.addColorStop(1, `rgba(${color}, 0)`)

        ctx.beginPath()
        ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('resize', resize)
    }
  }, [color, maxRipples])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}