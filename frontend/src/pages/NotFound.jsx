import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="font-display text-7xl md:text-9xl font-bold text-leaf/15 leading-none">404</div>
          <h1 className="font-display text-2xl font-semibold mt-4 mb-2">Page not found</h1>
          <p className="text-onLight/55 mb-8">That link doesn't go anywhere on Kora.</p>
          <Link to="/"><Button size="lg">Back to home</Button></Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}