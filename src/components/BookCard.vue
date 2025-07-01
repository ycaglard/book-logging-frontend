<template>
  <div class="book-card">
    <div class="cover-container">
      <RouterLink :to="`/books/${book.id}`">
        <img :src="book.coverUrl" :alt="book.title" class="book-cover" />
      </RouterLink>
      <div class="hover-actions">
        <button @click="logBook(book.id)">Log</button>
        <button @click="likeBook(book.id)">Like</button>
      </div>
    </div>

    <div class="book-info">
      <div class="title">
        <span class="title-text">{{ book.title }}</span>
        <span class="year">({{ book.publicationYear }})</span>
      </div>
      <div class="rating">
        ⭐ {{ book.averageRating.toFixed(1) }}
        <span class="rating-count">({{ book.numberOfRatings }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const { book } = defineProps({
  book: Object,
})

const logBook = (bookId) => {
  console.log('Log book:', bookId)
}

const likeBook = (bookId) => {
  console.log('Like book:', bookId)
}
</script>

<style scoped>
.book-card {
  width: 160px;
  max-width: 100%;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s ease;
  position: relative;
}

.book-card:hover .cover-container {
  border: 2px solid white;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hover-actions {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-container:hover .hover-actions {
  opacity: 1;
}

.hover-actions button {
  background: #0077cc;
  color: white;
  border: none;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: none;
}

.hover-actions button:hover {
  background: #005fa3;
}

.book-info {
  padding: 0.6rem 0.4rem;
  color: #eee;
  text-align: center;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  white-space: nowrap;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px; /* You can adjust this value if needed */
  display: inline-block;
}

.year {
  flex-shrink: 0;
  color: #aaa;
  font-size: 0.7rem;
}

.rating {
  font-size: 0.8rem;
  color: #ccc;
}

.rating-count {
  color: #888;
}
</style>
