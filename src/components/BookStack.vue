<template>
  <div class="book-stack">
    <div
      v-if="visibleBooks.length > 0"
      v-for="(book, index) in visibleBooks"
      :key="book.id"
      class="book-cover"
      :class="{
        'first-cover': index === 0,
        'last-cover': index === visibleBooks.length - 1,
      }"
      :style="{ zIndex: visibleBooks.length - index }"
    >
      <CachedImage 
        :src="book.coverUrl" 
        :alt="book.title"
        :show-loading="false"
        image-class="stack-cover-image"
      />
    </div>
    
    <!-- Placeholder for empty lists -->
    <div v-else class="book-cover empty-placeholder">
      <div class="empty-content">
        <BookOpen class="empty-icon" />
        <span class="empty-text">No books yet</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { getCoverUrl } from '@/utils/coverCache.js'
import CachedImage from '@/components/CachedImage.vue'

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
})

const visibleBooks = computed(() => {
  return props.books.slice(0, 5).map(book => {
    console.log('BookStack: book.title =', book.title, ', coverId =', book.coverId)
    const coverUrl = getCoverUrl(book.coverId, 'M')
    console.log('BookStack: generated coverUrl =', coverUrl)
    return {
      ...book,
      coverUrl // Use cached cover URL generation
    }
  })
})
</script>

<style scoped>
.book-stack {
  display: flex;
  align-items: flex-start;
  position: relative;
  overflow: visible;
}

.book-cover {
  position: relative;
  width: 160px;
  aspect-ratio: 3 / 4;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  margin-left: -100px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
}

.first-cover {
  margin-left: 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.last-cover {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.book-cover :deep(.stack-cover-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.book-cover :deep(.cached-image-container) {
  width: 100%;
  height: 100%;
}

.empty-placeholder {
  margin-left: 0;
  background: linear-gradient(135deg, rgb(60, 60, 60), rgb(40, 40, 40));
  border: 2px dashed rgb(100, 100, 100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgb(150, 150, 150);
  text-align: center;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  color: rgb(120, 120, 120);
}

.empty-text {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
