import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// Log the API configuration
console.log('🔧 API Configuration:')
console.log('📍 Base URL: http://localhost:8080/api (hardcoded)')

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  console.log('🔑 Token from localStorage:', token ? 'Found' : 'Not found')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Authorization header set')
    console.log('🔑 Token value (first 20 chars):', token.substring(0, 20) + '...')
  } else {
    console.log('⚠️ No token found - request will be sent without authentication')
  }
  
  // Log the full URL for each API call
  const fullUrl = `${config.baseURL || ''}${config.url}`
  console.log(`🌐 API Call: ${config.method?.toUpperCase()} ${fullUrl}`)
  console.log('📤 Request Data:', config.data)
  console.log('📋 Request Headers:', {
    'Authorization': config.headers.Authorization ? 'Bearer [TOKEN]' : 'Not set',
    'Content-Type': config.headers['Content-Type'],
    'Accept': config.headers.Accept
  })
  
  return config
})

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    console.log('📥 Response Data:', response.data)
    return response
  },
  (error) => {
    console.log(`❌ Error: ${error.response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
    console.log('📥 Error Data:', error.response?.data)
    console.log('📋 Error Headers:', error.response?.headers)
    console.log('🔍 Full Error Object:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default api
