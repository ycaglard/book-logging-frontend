<template>
  <div class="books-view">
    <h1>Books</h1>
    <div class="books-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
  </div>
</template>

<script setup>
import BookCard from '@/components/BookCard.vue'
import { books } from '@/data/sampleData.js'
</script>

<style scoped>
.books-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  justify-content: start;
}
</style>
