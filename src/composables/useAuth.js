import { ref, computed } from 'vue'
import router from '@/router'
import api from '@/api/api.js' // your axios instance

const token = ref(null)
const username = ref('')
const isAuthenticated = ref(false)

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.log(e)
    return null
  }
}

function initializeAuth() {
  const storedToken = localStorage.getItem('token')
  const storedUsername = localStorage.getItem('username')

  if (storedToken && storedToken !== 'undefined') {
    const payload = parseJwt(storedToken)
    const currentTime = Date.now() / 1000

    if (payload && payload.exp && payload.exp < currentTime) {
      console.log('🔐 Token expired. Logging out...')
      logout()
      return
    }

    token.value = storedToken
    username.value = storedUsername || ''
    isAuthenticated.value = true
    console.log('🔐 Auth initialized from localStorage')
  } else {
    console.log('🔐 No valid auth found in localStorage')
  }
}

function login(receivedToken, receivedUsername) {
  token.value = receivedToken
  username.value = receivedUsername
  isAuthenticated.value = true
  localStorage.setItem('token', receivedToken)
  localStorage.setItem('username', receivedUsername)
}

function logout() {
  token.value = null
  username.value = ''
  isAuthenticated.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const isLoggedIn = computed(() => isAuthenticated.value && !!token.value)

async function performLogin(credentials) {
  try {
    const response = await api.post('/auth/login', credentials)
    const receivedToken = response.data // string JWT token

    if (typeof receivedToken === 'string' && receivedToken.length > 0) {
      // Use username from credentials directly (prompted by user)
      const inputUsername = credentials.username

      login(receivedToken, inputUsername) // Save token and username
      return { success: true }
    } else {
      return { success: false, error: 'Invalid login response' }
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    }
  }
}

export function useAuth() {
  return {
    token,
    username,
    isAuthenticated,
    isLoggedIn,
    login, // low-level setter, not API call
    logout,
    initializeAuth,
    performLogin, // the async login that calls backend
  }
}
