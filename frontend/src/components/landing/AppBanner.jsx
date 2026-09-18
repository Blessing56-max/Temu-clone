import { Smartphone, Apple } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function AppBanner() {
  return (
    <section className="container-page py-10">
      <Reveal>
        <div className="relative bg-ink rounded-3xl overflow-hidden">
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-leaf/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-canopy/50 blur-[100px] pointer-events-none" />

          <div className="relative grid md:grid-cols-[1fr_1fr] gap-6 p-8 md:p-10 items-center">
            <div>
              <div className="flex items-center gap-2 text-leaf text-xs font-semibold uppercase tracking-wide mb-3">
                <Smartphone size={14} /> Kora on the go
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-onDark leading-tight">
                Shop Anytime,<br />
                <span className="text-leaf">Anywhere</span>
              </h2>
              <p className="text-onDark/60 text-sm mt-3 max-w-md">
                Get the best deals in your pocket. Track orders, save favourites, pay securely.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <button className="flex items-center gap-2.5 bg-onDark text-ink rounded-xl px-4 py-2.5 hover:bg-onDark/90 transition-colors">
                  <Apple size={20} fill="currentColor" />
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-wide opacity-70">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-2.5 bg-onDark text-ink rounded-xl px-4 py-2.5 hover:bg-onDark/90 transition-colors">
                  <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-coral via-amber to-leaf" />
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-wide opacity-70">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="hidden md:flex justify-center relative">
              <div className="w-48 h-80 bg-canopy border-[10px] border-onDark/20 rounded-[36px] shadow-2xl relative overflow-hidden rotate-[-8deg]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-onDark/20 rounded-full" />
                <div className="absolute inset-3 top-8 rounded-2xl bg-gradient-to-br from-leaf/20 to-canopy overflow-hidden">
                  <div className="p-3 space-y-2">
                    <div className="h-2 w-3/4 bg-onDark/20 rounded-full" />
                    <div className="h-2 w-1/2 bg-onDark/15 rounded-full" />
                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                      {[1,2,3,4].map((n) => <div key={n} className="aspect-square rounded-lg bg-onDark/10" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}