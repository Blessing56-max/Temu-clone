import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

// -------- Async thunks --------
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async ({ q = '', categoryId = null, minPrice = null, maxPrice = null, page = 0, size = 24 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (categoryId) params.set('categoryId', categoryId)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('page', page)
      params.set('size', size)
      const data = await api.get(`/products?${params.toString()}`)
      return data
    } catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchProduct = createAsyncThunk(
  'catalog/fetchProduct',
  async (id, { rejectWithValue }) => {
    try { return await api.get(`/products/${id}`) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchCategories = createAsyncThunk(
  'catalog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try { return await api.get('/categories') }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchCart = createAsyncThunk(
  'catalog/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    if (!getState().auth.isAuthenticated) return { id: null, items: [], totalItems: 0, subtotal: 0 }
    try { return await api.get('/cart') }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const addToCartApi = createAsyncThunk(
  'catalog/addToCartApi',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try { return await api.post('/cart/items', { productId, quantity }) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const updateCartItemApi = createAsyncThunk(
  'catalog/updateCartItemApi',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try { return await api.put(`/cart/items/${itemId}`, { quantity }) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const removeCartItemApi = createAsyncThunk(
  'catalog/removeCartItemApi',
  async (itemId, { rejectWithValue }) => {
    try { return await api.delete(`/cart/items/${itemId}`) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchWishlist = createAsyncThunk(
  'catalog/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    if (!getState().auth.isAuthenticated) return { id: null, items: [], totalItems: 0 }
    try { return await api.get('/wishlist') }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const addToWishlistApi = createAsyncThunk(
  'catalog/addToWishlistApi',
  async (productId, { rejectWithValue }) => {
    try { return await api.post('/wishlist/items', { productId }) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const removeWishlistItemApi = createAsyncThunk(
  'catalog/removeWishlistItemApi',
  async (itemId, { rejectWithValue }) => {
    try { return await api.delete(`/wishlist/items/${itemId}`) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchProductReviews = createAsyncThunk(
  'catalog/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try { return await api.get(`/products/${productId}/reviews`) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const fetchMyOrders = createAsyncThunk(
  'catalog/fetchMyOrders',
  async (_, { rejectWithValue, getState }) => {
    if (!getState().auth.isAuthenticated) return { content: [] }
    try { return await api.get('/orders?size=20') }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const checkoutApi = createAsyncThunk(
  'catalog/checkoutApi',
  async ({ deliveryName, deliveryPhone, deliveryAddress }, { rejectWithValue }) => {
    try {
      const order = await api.post('/orders/checkout', { deliveryName, deliveryPhone, deliveryAddress })
      // Immediately mark as paid (MockPaymentService auto-succeeds)
      const paid = await api.post(`/orders/${order.id}/pay`, {})
      return paid
    } catch (e) { return rejectWithValue(e.message) }
  }
)

export const recordProductView = createAsyncThunk(
  'catalog/recordProductView',
  async (productId, { rejectWithValue }) => {
    try { return await api.post(`/products/${productId}/view`, {}) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

// -------- Slice --------
const initialState = {
  products: [],
  productsLoading: false,
  productsError: null,
  totalProducts: 0,
  currentPage: 0,
  totalPages: 1,
  currentProduct: null,
  productLoading: false,
  categories: [],
  cart: { id: null, items: [], totalItems: 0, subtotal: 0 },
  cartLoading: false,
  wishlist: { id: null, items: [], totalItems: 0 },
  reviews: {},
  orders: [],
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearCurrentProduct(state) { state.currentProduct = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.productsLoading = true })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.productsLoading = false
        s.products = a.payload.content || []
        s.totalProducts = a.payload.totalElements || 0
        s.currentPage = a.payload.number || 0
        s.totalPages = a.payload.totalPages || 1
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.productsLoading = false
        s.productsError = a.payload
      })
      .addCase(fetchProduct.pending, (s) => { s.productLoading = true })
      .addCase(fetchProduct.fulfilled, (s, a) => {
        s.productLoading = false
        s.currentProduct = a.payload
      })
      .addCase(fetchProduct.rejected, (s) => { s.productLoading = false })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload || [] })
      .addCase(fetchCart.fulfilled, (s, a) => { s.cart = a.payload })
      .addCase(addToCartApi.fulfilled, (s, a) => { s.cart = a.payload })
      .addCase(updateCartItemApi.fulfilled, (s, a) => { s.cart = a.payload })
      .addCase(removeCartItemApi.fulfilled, (s, a) => { s.cart = a.payload })
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.wishlist = a.payload })
      .addCase(addToWishlistApi.fulfilled, (s, a) => { s.wishlist = a.payload })
      .addCase(removeWishlistItemApi.fulfilled, (s, a) => { s.wishlist = a.payload })
      .addCase(fetchProductReviews.fulfilled, (s, a) => {
        s.reviews[a.payload.productId] = a.payload
      })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.orders = a.payload.content || [] })
      .addCase(checkoutApi.fulfilled, (s) => {
        s.cart = { id: null, items: [], totalItems: 0, subtotal: 0 }
      })
  },
})

export const { clearCurrentProduct } = catalogSlice.actions
export default catalogSlice.reducer