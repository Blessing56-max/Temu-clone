import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import UtilityBar from '@/components/landing/UtilityBar'
import PromoBanner from '@/components/landing/PromoBanner'
import CategoryStrip from '@/components/landing/CategoryStrip'
import HeroSection from '@/components/landing/HeroSection'
import TrustRow from '@/components/landing/TrustRow'
import CategoryGrid from '@/components/landing/CategoryGrid'
import FlashDeals from '@/components/landing/FlashDeals'
import ProductShowcase from '@/components/landing/ProductShowcase'
import AppBanner from '@/components/landing/AppBanner'
import ShortcutTiles from '@/components/landing/ShortcutTiles'
import StatsBand from '@/components/landing/StatsBand'
import WhyShopSell from '@/components/landing/WhyShopSell'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import SellerSpotlight from '@/components/landing/SellerSpotlight'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FaqSection from '@/components/landing/FaqSection'
import { fetchProducts } from '@/store/slices/catalogSlice'

export default function LandingPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProducts({ size: 24 }))
  }, [dispatch])

  return (
    <div className="bg-paper">
      <UtilityBar />
      <Navbar />
      <PromoBanner />
      <CategoryStrip />

      <HeroSection />
      <TrustRow />
      <CategoryGrid />
      <FlashDeals />
      <ProductShowcase />
      <AppBanner />
      <ShortcutTiles />
      <StatsBand />
      <WhyShopSell />
      <HowItWorksSection />
      <SellerSpotlight />
      <TestimonialsSection />
      <FaqSection />

      <Footer />
    </div>
  )
}