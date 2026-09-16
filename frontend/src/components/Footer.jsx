import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-canopy/[0.04] border-t border-onLight/8 mt-32">
      <div className="container-page py-14 flex flex-col md:flex-row justify-between gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="size-2.5 rounded-full bg-leaf" />
            <span className="font-display font-semibold text-lg tracking-tight text-onLight">
              Kora
            </span>
          </div>
          <p className="max-w-xs text-onLight/50">
            Fast and Easy Marketing. A marketplace built for the people who make things, and the people who love finding them.
          </p>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Company</span>
            <Link to="/#why-shop" className="text-onLight/60 hover:text-leaf-dim">Why shop with us</Link>
            <Link to="/#why-sell" className="text-onLight/60 hover:text-leaf-dim">Why sell with us</Link>
            <Link to="/#partner" className="text-onLight/60 hover:text-leaf-dim">Partner with us</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Legal</span>
            <Link to="/terms" className="text-onLight/60 hover:text-leaf-dim">Terms & Privacy</Link>
          </div>
        </div>
      </div>
      <div className="container-page py-6 border-t border-onLight/8 text-xs text-onLight/35">
        © {new Date().getFullYear()} Kora Marketplace · Fast and Easy Marketing
      </div>
    </footer>
  )
}