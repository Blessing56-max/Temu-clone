import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageLoader from './components/PageLoader'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthEntry = lazy(() => import('./features/auth/pages/AuthEntry'))
const Login = lazy(() => import('./features/auth/pages/Login'))
const RegistrationForm = lazy(() => import('./features/auth/pages/RegistrationForm'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'))
const ProfileCustomization = lazy(() => import('./pages/ProfileCustomization'))
const ProductsBrowse = lazy(() => import('./pages/ProductsBrowse'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CheckoutFlow = lazy(() => import('./pages/CheckoutFlow'))
const CartPage = lazy(() => import('./pages/CartPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const NotFound = lazy(() => import('./pages/NotFound'))

const BecomeSellerPage = lazy(() => import('./pages/seller/BecomeSellerPage'))
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage'))
const SellerProductsPage = lazy(() => import('./pages/seller/SellerProductsPage'))
const SellerProductFormPage = lazy(() => import('./pages/seller/SellerProductFormPage'))
const SellerOrdersPage = lazy(() => import('./pages/seller/SellerOrdersPage'))
const SellerAnalyticsPage = lazy(() => import('./pages/seller/SellerAnalyticsPage'))

export default function App() {
  const location = useLocation()
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthEntry />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/profile" element={<ProfileCustomization />} />
          <Route path="/products" element={<ProductsBrowse />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutFlow />} />
          <Route path="/orders/:id" element={<OrderTrackingPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Seller */}
          <Route path="/sell" element={<BecomeSellerPage />} />
          <Route path="/vendor/dashboard" element={<SellerDashboardPage />} />
          <Route path="/vendor/orders" element={<SellerOrdersPage />} />
          <Route path="/vendor/products" element={<SellerProductsPage />} />
          <Route path="/vendor/products/new" element={<SellerProductFormPage />} />
          <Route path="/vendor/products/:id/edit" element={<SellerProductFormPage />} />
          <Route path="/vendor/analytics" element={<SellerAnalyticsPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}