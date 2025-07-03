<template>
  <div class="book-stack">
    <div
      v-for="(book, index) in visibleBooks"
      :key="book.id"
      class="book-cover"
      :class="{
        'first-cover': index === 0,
        'last-cover': index === visibleBooks.length - 1,
      }"
      :style="{ zIndex: visibleBooks.length - index }"
    >
      <img :src="book.coverUrl" :alt="book.title" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
})

const visibleBooks = computed(() => props.books.slice(0, 5))
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

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
</style>
