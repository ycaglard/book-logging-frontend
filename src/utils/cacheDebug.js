import { getCacheStats, getCacheMetrics } from './coverCache.js'

/**
 * Debug cache performance
 */
export function debugCache() {
  const stats = getCacheStats()
  console.group('📊 Cover Cache Statistics')
  console.log('Cache size:', stats.size)
  console.log('Cached entries:', stats.entries)
  console.groupEnd()
}

export function logCacheMetrics() {
  const metrics = getCacheMetrics()
  console.group('🎯 Cache Performance Metrics')
  console.log('Cache hits:', metrics.hits)
  console.log('Cache misses:', metrics.misses)
  console.log('Total requests:', metrics.total)
  console.log('Hit rate:', metrics.hitRate)
  console.groupEnd()
}

// Add cache debugging to window for manual inspection in dev tools
if (typeof window !== 'undefined') {
  window.debugCoverCache = {
    stats: debugCache,
    metrics: logCacheMetrics,
    getCacheStats,
    getCacheMetrics
  }
} 