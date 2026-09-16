import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Wraps a section so it slides + fades into view as it scrolls into the
// viewport. `direction` controls which way it comes from:
//   'up'    (default) — slides up from below, like before
//   'down'  — drops in from above
//   'left'  — slides in from the left
//   'right' — slides in from the right
// Movement distances are bigger than the original (32px -> 70/90px) for a
// more noticeable, "bigger" animation as requested.
const FROM_VARS = {
  up: { opacity: 0, y: 70 },
  down: { opacity: 0, y: -70 },
  left: { opacity: 0, x: -90 },
  right: { opacity: 0, x: 90 },
}

export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fromVars = FROM_VARS[direction] || FROM_VARS.up
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        fromVars,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [delay, direction])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
