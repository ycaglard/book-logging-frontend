import { ref, computed } from 'vue'
import api from '@/api/api.js'

// Global reactive authentication state
const isAuthenticated = ref(false)
const username = ref('')
const token = ref('')

// Initialize auth state from localStorage
function initializeAuth() {
  const storedToken = localStorage.getItem('token')
  const storedUsername = localStorage.getItem('username')
  
  if (storedToken && storedToken !== 'undefined') {
    token.value = storedToken
    username.value = storedUsername || ''
    isAuthenticated.value = true
    console.log('🔐 Auth initialized from localStorage')
  } else {
    console.log('🔐 No valid auth found in localStorage')
  }
}

// Initialize auth on import
initializeAuth()

// Composable function
export function useAuth() {
  // Login function
  async function login(loginData) {
    try {
      console.log('🔐 Attempting login...')
      const response = await api.post('/auth/login', loginData)
      
      console.log('🔐 Login Response:', response.data)
      console.log('🔐 Full Response Object:', response)
      
      // Try different possible token field names
      const authToken = response.data.token || 
                       response.data.access_token || 
                       response.data.jwt || 
                       response.data.authToken ||
                       response.data
      
      console.log('🔑 Extracted token:', authToken)
      console.log('🔑 Token type:', typeof authToken)
      console.log('🔑 Token length:', authToken?.length)
      
      const authUsername = loginData.username
      
      if (authToken && authToken !== 'undefined' && typeof authToken === 'string' && authToken.length > 10) {
        localStorage.setItem('token', authToken)
        localStorage.setItem('username', authUsername)
        
        token.value = authToken
        username.value = authUsername
        isAuthenticated.value = true
        
        console.log('✅ Login successful')
        console.log('✅ Token stored:', authToken.substring(0, 20) + '...')
        return { success: true }
      } else {
        console.error('❌ Login failed: No valid token received')
        console.error('❌ Token value:', authToken)
        console.error('❌ Response data keys:', Object.keys(response.data))
        return { success: false, error: 'No valid token received from server' }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  // Logout function
  async function logout() {
    try {
      console.log('🚪 Attempting logout...')
      
      // Call backend logout endpoint if user is authenticated
      if (token.value) {
        await api.post('/auth/logout')
        console.log('✅ Backend logout successful')
      }
    } catch (error) {
      console.error('❌ Backend logout error:', error)
      // Continue with frontend logout even if backend fails
    }
    
    // Clear frontend authentication state
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    
    token.value = ''
    username.value = ''
    isAuthenticated.value = false
    
    console.log('✅ Frontend logout complete')
    
    // Redirect to home page (use window.location to avoid router issues)
    window.location.href = '/'
  }

  // Check if user is authenticated
  const isLoggedIn = computed(() => isAuthenticated.value && !!token.value)

  return {
    isAuthenticated,
    username,
    token,
    isLoggedIn,
    login,
    logout,
    initializeAuth
  }
} 