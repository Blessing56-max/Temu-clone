import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import adminReducer from './slices/adminSlice'
import catalogReducer from './slices/catalogSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    catalog: catalogReducer,
  },
})