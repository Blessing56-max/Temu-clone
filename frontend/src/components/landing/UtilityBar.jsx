import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, RotateCcw, Zap, Store } from 'lucide-react'

function useCountdown() {
  const [remain, setRemain] = useState(0)
  useEffect(() => {
    const tick = () => {
      const t = new Date()
      t.setHours(24, 0, 0, 0)
      setRemain(t - Date.now())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const c = Math.max(0, remain)
  return {
    h: String(Math.floor(c / 3_600_000)).padStart(2, '0'),
    m: String(Math.floor((c % 3_600_000) / 60_000)).padStart(2, '0'),
    s: String(Math.floor((c % 60_000) / 1000)).padStart(2, '0'),
  }
}

export default function UtilityBar() {
  const { h, m, s } = useCountdown()

  return (
    <div className="bg-ink text-onDark text-[11px]">
      <div className="container-page py-2 flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-1.5">
          <Truck size={14} className="text-leaf shrink-0" />
          <span>Free shipping on orders over N50,000</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-onDark/70">Flash sale ends in</span>
          <div className="flex items-center gap-1">
            {[h, m, s].map((v, i) => (
              <span key={i} className="bg-leaf/20 text-leaf font-semibold px-1.5 py-0.5 rounded-md min-w-[22px] text-center tabular-nums">
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-leaf" />
            <span>Secure payments</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <RotateCcw size={14} className="text-leaf" />
            <span>Easy returns</span>
          </div>
          <Link to="/sell" className="flex items-center gap-1.5 hover:text-leaf transition-colors font-medium">
            <Store size={14} />
            <span>Sell on Kora</span>
          </Link>
        </div>

        <Link to="/sell" className="md:hidden flex items-center gap-1.5 hover:text-leaf font-medium">
          <Store size={14} />
          <span>Sell</span>
        </Link>
      </div>
    </div>
  )
}