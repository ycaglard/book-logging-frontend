import { ref, computed, watch } from 'vue'
import { getCoverUrl, getCoverUrlWithFallback } from '@/utils/coverCache.js'

/**
 * Composable for reactive cover image management
 * @param {Ref} coverId - Reactive cover ID
 * @param {string} size - Image size ('S', 'M', or 'L')
 * @param {boolean} usePreload - Whether to preload and verify images
 * @returns {Object} Cover image management object
 */
export function useCoverImage(coverId, size = 'M', usePreload = false) {
  const coverUrl = ref('/src/assets/cover.jpg')
  const loading = ref(false)
  const error = ref(false)

  // Simple URL generation (synchronous)
  const simpleCoverUrl = computed(() => {
    return getCoverUrl(coverId.value, size)
  })

  // Function to load cover with preload validation
  async function loadCover() {
    if (!coverId.value) {
      coverUrl.value = '/src/assets/cover.jpg'
      loading.value = false
      error.value = false
      return
    }

    loading.value = true
    error.value = false

    try {
      const url = await getCoverUrlWithFallback(coverId.value, size)
      coverUrl.value = url
      error.value = (url === '/src/assets/cover.jpg')
    } catch (err) {
      console.error('Cover loading error:', err)
      coverUrl.value = '/src/assets/cover.jpg'
      error.value = true
    } finally {
      loading.value = false
    }
  }

  // Watch for changes in coverId and reload
  watch(coverId, () => {
    if (usePreload) {
      loadCover()
    }
  }, { immediate: true })

  // Return appropriate URL based on preload setting
  const finalCoverUrl = computed(() => {
    return usePreload ? coverUrl.value : simpleCoverUrl.value
  })

  return {
    coverUrl: finalCoverUrl,
    loading,
    error,
    loadCover,
    refresh: loadCover
  }
}

/**
 * Simple cover URL composable (no preloading)
 * @param {Ref} coverId - Reactive cover ID  
 * @param {string} size - Image size ('S', 'M', or 'L')
 * @returns {ComputedRef} Cover URL
 */
export function useSimpleCoverUrl(coverId, size = 'M') {
  return computed(() => {
    console.log(`useSimpleCoverUrl: coverId = ${coverId.value}, size = ${size}`)
    const url = getCoverUrl(coverId.value, size)
    console.log(`useSimpleCoverUrl: generated URL = ${url}`)
    return url
  })
} 