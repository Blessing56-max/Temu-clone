import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  vendorQueue: [
    {
      id: 'v-1001',
      businessName: 'Lagos Leather Co.',
      businessCategory: 'Fashion & Accessories',
      expectedProductRange: '20–50 SKUs',
      documentUrls: ['id_front.jpg', 'cac_certificate.pdf'],
      submittedAt: '2026-07-05T10:12:00Z',
      status: 'pending',
    },
    {
      id: 'v-1002',
      businessName: 'Everstock Electronics',
      businessCategory: 'Electronics',
      expectedProductRange: '100+ SKUs',
      documentUrls: ['id_front.jpg'],
      submittedAt: '2026-07-06T14:40:00Z',
      status: 'pending',
    },
    {
      id: 'v-1006',
      businessName: 'Bare Botanicals',
      businessCategory: 'Beauty',
      expectedProductRange: '10–50 SKUs',
      documentUrls: ['id_front.jpg', 'cac_certificate.pdf'],
      submittedAt: '2026-07-08T11:20:00Z',
      status: 'pending',
    },
  ],
  customerQueue: [
    { id: 'c-9001', name: 'Ngozi Eze', reason: 'Address mismatch on ID', submittedAt: '2026-07-07T09:00:00Z', status: 'pending' },
  ],
  activityLog: [
    { id: 'a-1', userId: 'u-204', action: 'login', createdAt: '2026-07-08T08:02:00Z' },
    { id: 'a-2', userId: 'u-311', action: 'order_placed', createdAt: '2026-07-08T09:14:00Z' },
    { id: 'a-3', userId: 'u-118', action: 'product_listed', createdAt: '2026-07-08T09:40:00Z' },
    { id: 'a-4', userId: 'u-402', action: 'login', createdAt: '2026-07-08T10:05:00Z' },
    { id: 'a-5', userId: 'u-118', action: 'order_placed', createdAt: '2026-07-08T11:22:00Z' },
    { id: 'a-6', userId: 'u-561', action: 'product_listed', createdAt: '2026-07-09T08:12:00Z' },
  ],
  dashboardCuration: {
    featuredCategories: ['Electronics', 'Fashion', 'Home'],
    banners: [{ id: 'b-1', title: 'Mid-year sale', active: true }],
  },
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    approveVendor(state, action) {
      const v = state.vendorQueue.find((v) => v.id === action.payload)
      if (v) v.status = 'verified'
    },
    rejectVendor(state, action) {
      const { id, reason } = action.payload
      const v = state.vendorQueue.find((v) => v.id === id)
      if (v) {
        v.status = 'rejected'
        v.rejectionReason = reason
      }
    },
    toggleFeaturedCategory(state, action) {
      const cat = action.payload
      const list = state.dashboardCuration.featuredCategories
      state.dashboardCuration.featuredCategories = list.includes(cat)
        ? list.filter((c) => c !== cat)
        : [...list, cat]
    },
  },
})

export const { approveVendor, rejectVendor, toggleFeaturedCategory } = adminSlice.actions
export default adminSlice.reducer
