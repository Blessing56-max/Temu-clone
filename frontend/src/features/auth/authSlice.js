import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api'

const USER_KEY = 'kora_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function storeUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, phone }, { rejectWithValue }) => {
    try {
      const data = await api.post('/auth/register', { email, password, fullName, phone })
      setTokens(data)
      return data.user
    } catch (e) { return rejectWithValue(e.message) }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await api.post('/auth/login', { email, password })
      setTokens(data)
      return data.user
    } catch (e) { return rejectWithValue(e.message) }
  }
)

export const loadCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try { return await api.get('/auth/me') }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout', {}) } catch {}
  clearTokens()
  return true
})

const initialState = {
  user: loadStoredUser(),
  isAuthenticated: !!getAccessToken(),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload; s.isAuthenticated = true
        storeUser(a.payload)
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload || 'Registration failed'
      })
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload; s.isAuthenticated = true
        storeUser(a.payload)
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload || 'Login failed'
      })
      .addCase(loadCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload; s.isAuthenticated = true; storeUser(a.payload)
      })
      .addCase(loadCurrentUser.rejected, (s) => {
        s.user = null; s.isAuthenticated = false; clearTokens(); storeUser(null)
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null; s.isAuthenticated = false; storeUser(null)
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer