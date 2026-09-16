import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Button from '@/components/ui/Button'
import HeroSection from '@/components/landing/HeroSection'
import TrustRow from '@/components/landing/TrustRow'
import StatsBand from '@/components/landing/StatsBand'
import CategoryGrid from '@/components/landing/CategoryGrid'
import ProductShowcase from '@/components/landing/ProductShowcase'
import FlashDeals from '@/components/landing/FlashDeals'
import WhyShopSell from '@/components/landing/WhyShopSell'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import SellerSpotlight from '@/components/landing/SellerSpotlight'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FaqSection from '@/components/landing/FaqSection'
import { fetchProducts } from '@/store/slices/catalogSlice'

export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchProducts({ size: 24 }))
  }, [dispatch])

  return (
    <div>
      <Navbar />

      <HeroSection />
      <TrustRow />
      <StatsBand />
      <CategoryGrid />
      <ProductShowcase />
      <FlashDeals />
      <WhyShopSell />
      <HowItWorksSection />
      <SellerSpotlight />
      <TestimonialsSection />
      <FaqSection />

      {/* Final CTA */}
      <section className="bg-canopy py-28 relative overflow-hidden">
        <div className="absolute inset-0 market-grid opacity-30" aria-hidden="true" />
        <div className="container-page relative z-10">
          <Reveal direction="up" className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-onDark leading-tight">
              Ready to make something real?
            </h2>
            <p className="text-onDark/60 text-lg mt-5 mb-9">
              Join thousands of shoppers and sellers building a marketplace that respects their time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="primary" onClick={() => navigate('/auth')}>
                Get started <ArrowRight size={15} />
              </Button>
              <Button size="lg" variant="outlineDark" onClick={() => navigate('/products')}>
                Browse products
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}