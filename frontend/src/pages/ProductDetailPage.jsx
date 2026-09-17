import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Star, ShoppingBag, Heart, Package, ShieldCheck, Truck, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import PriceTag from '@/components/PriceTag'
import ProductThumb from '@/components/ProductThumb'
import {
  fetchProduct,
  fetchProductReviews,
  addToCartApi,
  addToWishlistApi,
  recordProductView,
} from '@/store/slices/catalogSlice'
import { api, resolveImageUrl } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const product = useSelector((s) => s.catalog.currentProduct)
  const loading = useSelector((s) => s.catalog.productLoading)
  const reviews = useSelector((s) => s.catalog.reviews[id])
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  // Review form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    dispatch(fetchProduct(id))
    dispatch(fetchProductReviews(id))
    dispatch(recordProductView(id))
  }, [dispatch, id])

  async function handleAddToCart() {
    if (!isAuthed || !product) return
    await dispatch(addToCartApi({ productId: product.id, quantity: 1 }))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  async function handleWishlist() {
    if (!isAuthed || !product) return
    try {
      await dispatch(addToWishlistApi(product.id)).unwrap()
      setWishlisted(true)
      setTimeout(() => setWishlisted(false), 2500)
    } catch (e) {
      // Already in wishlist or other issue — silently ignore
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (rating < 1) {
      setReviewError('Pick a rating (1-5 stars)')
      return
    }
    setSubmitting(true)
    setReviewError(null)
    try {
      await api.post('/reviews', { productId: Number(id), rating, comment })
      setReviewSuccess(true)
      setComment('')
      setRating(0)
      dispatch(fetchProductReviews(id))
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (err) {
      setReviewError(err.message || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square rounded-3xl bg-onLight/5 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-20 bg-onLight/5 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-onLight/5 rounded animate-pulse" />
              <div className="h-4 w-32 bg-onLight/5 rounded animate-pulse" />
              <div className="h-20 bg-onLight/5 rounded animate-pulse" />
              <div className="h-12 w-40 bg-onLight/5 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0
    ? [...product.images].sort((a, b) => a.position - b.position)
    : []
  const currentImage = images[activeImg]
  const avg = reviews?.averageRating

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12">
        <div className="text-xs text-onLight/40 mb-6">
          <Link to="/products" className="hover:text-leaf-dim">Products</Link>
          {product.categoryName && (
            <>
              <span className="mx-2">/</span>
              <span>{product.categoryName}</span>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-white border border-onLight/10"
            >
              {currentImage ? (
                <img src={resolveImageUrl(currentImage.url)} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ProductThumb product={product} iconSize={72} />
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'size-20 rounded-xl overflow-hidden border-2 transition-colors',
                      activeImg === i ? 'border-leaf' : 'border-transparent',
                    )}
                  >
                    <img src={resolveImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {product.categoryName && (
              <span className="text-xs font-medium text-leaf">{product.categoryName}</span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2 mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={15}
                    className={avg && n <= Math.round(avg) ? 'fill-amber text-amber' : 'text-onLight/20'}
                  />
                ))}
              </div>
              {avg && (
                <span className="text-xs text-onLight/50">
                  {avg} Â· {reviews?.totalReviews || 0} review{(reviews?.totalReviews || 0) !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="text-sm text-onLight/60">
              Sold by <span className="font-medium text-onLight">{product.sellerName}</span>
            </div>

            <p className="text-onLight/70 mt-6 mb-8 leading-relaxed">{product.description}</p>

            <div className="flex items-center justify-between gap-6 mb-8 py-6 border-y border-onLight/10">
              <PriceTag product={product} size="lg" />
              <div className="text-sm">
                {product.stock > 0 ? (
                  <span className="text-emerald">In stock Â· {product.stock} available</span>
                ) : (
                  <span className="text-coral">Out of stock</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0 || !isAuthed}>
                <ShoppingBag size={16} />
                {added ? 'Added to cart' : isAuthed ? 'Add to cart' : 'Login to buy'}
              </Button>
              <Button size="lg" variant="outline" onClick={handleWishlist} disabled={!isAuthed}>
                <Heart size={16} className={wishlisted ? 'fill-coral text-coral' : ''} />
                {wishlisted ? 'Added to wishlist!' : 'Wishlist'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-onLight/10 text-xs">
              <div className="flex items-center gap-2 text-onLight/60">
                <Truck size={14} className="text-leaf" /> 3-5 day delivery
              </div>
              <div className="flex items-center gap-2 text-onLight/60">
                <ShieldCheck size={14} className="text-leaf" /> 7-day returns
              </div>
              <div className="flex items-center gap-2 text-onLight/60">
                <Package size={14} className="text-leaf" /> Secure payment
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="border-t border-onLight/10 pt-12">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold">Reviews</h2>
            {avg && (
              <p className="text-sm text-onLight/50 mt-1">
                {avg} â˜… average Â· {reviews?.totalReviews || 0} review{(reviews?.totalReviews || 0) !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {(!reviews || reviews.reviews.length === 0) ? (
            <p className="text-sm text-onLight/45 mb-10">No reviews yet â€” be the first.</p>
          ) : (
            <div className="flex flex-col gap-4 max-w-2xl mb-10">
              {reviews.reviews.map((r) => (
                <div key={r.id} className="bg-white border border-onLight/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} className={n <= r.rating ? 'fill-amber text-amber' : 'text-onLight/20'} />
                      ))}
                    </div>
                    <span className="text-xs text-onLight/40">{r.userName}</span>
                  </div>
                  {r.comment && <p className="text-sm text-onLight/70">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {isAuthed ? (
            <div className="max-w-2xl bg-white border border-onLight/10 rounded-2xl p-6">
              <h3 className="font-display text-base font-semibold mb-2">Write a review</h3>
              <p className="text-xs text-onLight/50 mb-5">
                You can only review products you have purchased and received.
              </p>

              <form onSubmit={submitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-onLight/80 mb-2">Rating</label>
                  <div className="flex gap-1 items-center" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHoverRating(n)}
                        onClick={() => setRating(n)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                      >
                        <Star
                          size={26}
                          className={
                            n <= (hoverRating || rating)
                              ? 'fill-amber text-amber'
                              : 'text-onLight/25'
                          }
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-3 text-sm text-onLight/60">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-onLight/80 mb-2">Your review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="What did you like or dislike? How was the quality?"
                    className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf resize-y"
                  />
                  <div className="text-[10px] text-onLight/35 text-right mt-1">{comment.length}/2000</div>
                </div>

                {reviewError && (
                  <div className="text-sm text-coral bg-coral/8 border border-coral/20 rounded-xl px-4 py-2.5 mb-4">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="text-sm text-leaf-dim bg-leaf/8 border border-leaf/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                    <Check size={14} /> Review posted. Thanks for the feedback!
                  </div>
                )}

                <Button type="submit" loading={submitting} disabled={submitting || rating === 0}>
                  Post review
                </Button>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl bg-leaf/5 border border-leaf/20 rounded-2xl p-6">
              <p className="text-sm text-onLight/70">
                <Link to={`/login?redirect=/products/${id}`} className="text-leaf-dim font-medium hover:underline">
                  Log in
                </Link>{' '}
                to leave a review.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}