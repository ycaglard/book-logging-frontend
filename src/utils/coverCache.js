// Cover image caching utility
const coverCache = new Map()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const DEFAULT_COVER = '/src/assets/cover.jpg'

/**
 * Generate cover URL with caching
 * @param {string|number} coverId - The cover ID from Open Library
 * @param {string} size - Size: 'S', 'M', or 'L'
 * @returns {string} Cover URL or default cover
 */
export function getCoverUrl(coverId, size = 'M') {
  // Validate coverId
  if (!coverId || coverId <= 0) {
    console.log('Cover cache: No valid coverId, using default')
    return DEFAULT_COVER
  }

  const normalizedCoverId = String(coverId)
  const cacheKey = `${normalizedCoverId}-${size}`
  
  // Check cache first
  const cached = coverCache.get(cacheKey)
  if (cached) {
    const now = Date.now()
    if (now - cached.timestamp < CACHE_DURATION) {
      console.log(`Cover cache: Cache hit for ${cacheKey}`)
      trackCacheHit()
      return cached.url
    } else {
      // Cache expired, remove it
      coverCache.delete(cacheKey)
      console.log(`Cover cache: Cache expired for ${cacheKey}`)
    }
  }

  // Generate new URL
  const url = `https://covers.openlibrary.org/b/id/${normalizedCoverId}-${size}.jpg`
  
  // Cache the URL
  coverCache.set(cacheKey, {
    url: url,
    timestamp: Date.now()
  })
  
  trackCacheMiss()
  
  console.log(`Cover cache: New URL cached for ${cacheKey}:`, url)
  return url
}

/**
 * Preload cover image to verify it exists
 * @param {string} url - Cover URL to preload
 * @returns {Promise<string>} Resolves with URL if valid, rejects if not
 */
export function preloadCover(url) {
  return new Promise((resolve, reject) => {
    if (url === DEFAULT_COVER) {
      resolve(url)
      return
    }

    const img = new Image()
    
    img.onload = () => {
      console.log('Cover preload: Success for', url)
      resolve(url)
    }
    
    img.onerror = () => {
      console.log('Cover preload: Failed for', url, '- using default')
      reject(DEFAULT_COVER)
    }
    
    // Set crossOrigin to handle CORS
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

/**
 * Get cover URL with preloading and fallback
 * @param {string|number} coverId - The cover ID from Open Library
 * @param {string} size - Size: 'S', 'M', or 'L'
 * @returns {Promise<string>} Promise that resolves with valid cover URL
 */
export async function getCoverUrlWithFallback(coverId, size = 'M') {
  const url = getCoverUrl(coverId, size)
  
  if (url === DEFAULT_COVER) {
    return url
  }
  
  try {
    return await preloadCover(url)
  } catch (fallbackUrl) {
    return fallbackUrl
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache() {
  const now = Date.now()
  const keysToDelete = []
  
  for (const [key, value] of coverCache.entries()) {
    if (now - value.timestamp >= CACHE_DURATION) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => coverCache.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`Cover cache: Cleared ${keysToDelete.length} expired entries`)
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: coverCache.size,
    entries: Array.from(coverCache.keys())
  }
}

// Clean up expired cache entries every 5 minutes
setInterval(clearExpiredCache, 5 * 60 * 1000)

// Performance tracking
let cacheHits = 0
let cacheMisses = 0

export function trackCacheHit() {
  cacheHits++
}

export function trackCacheMiss() {
  cacheMisses++
}

export function getCacheMetrics() {
  const total = cacheHits + cacheMisses
  const hitRate = total > 0 ? (cacheHits / total * 100).toFixed(2) : 0
  
  return {
    hits: cacheHits,
    misses: cacheMisses,
    total,
    hitRate: `${hitRate}%`
  }
} 