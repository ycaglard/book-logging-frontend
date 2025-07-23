<template>
  <div class="cached-image-container">
    <!-- Loading placeholder -->
    <div v-if="isLoading" class="image-loading" :style="placeholderStyle">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- Actual image -->
    <img
      v-show="!isLoading && !hasError"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      @click="$emit('click', $event)"
      loading="lazy"
      decoding="async"
    />
    
    <!-- Error fallback -->
    <img
      v-if="hasError"
      :src="fallbackSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @click="$emit('click', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  fallbackSrc: {
    type: String,
    default: '/src/assets/cover.jpg'
  },
  imageClass: {
    type: String,
    default: ''
  },
  imageStyle: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  showLoading: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['load', 'error', 'click'])

const isLoading = ref(true)
const hasError = ref(false)
const imageSrc = ref('')

// Computed style for placeholder
const placeholderStyle = computed(() => {
  const style = { ...props.imageStyle }
  if (props.width) style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height) style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return style
})

// Handle image load
function handleLoad(event) {
  isLoading.value = false
  hasError.value = false
  emit('load', event)
}

// Handle image error
function handleError(event) {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

// Load image with caching
function loadImage() {
  if (!props.src) {
    handleError(new Event('error'))
    return
  }

  // Reset states
  isLoading.value = props.showLoading
  hasError.value = false
  
  // Set src to trigger loading
  imageSrc.value = props.src
}

// Watch for src changes
watch(() => props.src, (newSrc, oldSrc) => {
  console.log('CachedImage: src changed from', oldSrc, 'to', newSrc)
  loadImage()
}, { immediate: true })

onMounted(() => {
  loadImage()
})
</script>

<style scoped>
.cached-image-container {
  position: relative;
  display: inline-block;
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 8px;
  min-width: 100px;
  min-height: 140px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

img {
  max-width: 100%;
  height: auto;
}
</style> 