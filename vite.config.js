import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Add cache headers for development
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  },
  build: {
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Put cover cache utilities in a separate chunk
          'cover-cache': ['src/utils/coverCache.js', 'src/composables/useCoverImage.js']
        }
      }
    }
  }
})
