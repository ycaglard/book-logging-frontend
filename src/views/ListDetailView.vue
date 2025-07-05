<template>
  <div class="list-detail">
    <div class="list-info-total">
      <div class="title-user-row">
        <h1 class="list-title">{{ list.name }}</h1>
        <span class="list-user-info">
          by
          <router-link :to="`/profiles/${list.userId}`" class="list-user">
            {{ list.userId }}
          </router-link>
        </span>
        <div class="list-meta">
          <span class="icon-text"><Heart class="icon" /> {{ list.likes }} </span>
          <span class="icon-text"><Book class="icon" /> {{ list.booksCount }}</span>
        </div>
      </div>

      <div class="description-sort-row">
        <p class="list-description">{{ list.description }}</p>
        <div class="sort-controls">
          <label for="sort">sort by</label>
          <select id="sort" v-model="selectedSort">
            <option value="newest">Publication Date (Newest First)</option>
            <option value="oldest">Publication Date (Oldest First)</option>
            <option value="az">Book Name (A–Z)</option>
            <option value="za">Book Name (Z–A)</option>
            <option value="rating-high">Rating (High to Low)</option>
            <option value="rating-low">Rating (Low to High)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="book-grid">
      <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>

    <div class="comments-section">
      <h2>Comments ({{ list.comments }})</h2>
      <p class="placeholder-comment">Comments will appear here.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BookCard from '@/components/BookCard.vue'
import { list } from '@/data/sampleData.js'
import { Heart, Book } from 'lucide-vue-next'

const selectedSort = ref('newest')

const sortedBooks = computed(() => {
  const copy = [...list.books]

  switch (selectedSort.value) {
    case 'newest':
      return copy.sort((a, b) => b.publicationYear - a.publicationYear)
    case 'oldest':
      return copy.sort((a, b) => a.publicationYear - b.publicationYear)
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'za':
      return copy.sort((a, b) => b.title.localeCompare(a.title))
    case 'rating-high':
      return copy.sort((a, b) => b.averageRating - a.averageRating)
    case 'rating-low':
      return copy.sort((a, b) => a.averageRating - b.averageRating)
    default:
      return copy
  }
})
</script>

<style scoped>
.list-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  color: rgb(200, 200, 200);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.list-info-total {
  border-bottom: 1px solid rgb(100, 100, 100);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-user-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: nowrap;
}

.list-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: rgb(180, 180, 180);
  margin-bottom: 0.3rem;
}

.list-user-info {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgb(160, 160, 160);
  white-space: nowrap;
}

.list-user-info .list-user {
  color: rgb(160, 160, 160);
  text-decoration: none;
  margin-left: 0.2rem;
}

.list-user-info .list-user:hover,
.list-user:hover {
  text-decoration: underline;
  color: rgb(200, 200, 200);
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-left: 0.3rem;
  color: rgb(160, 160, 160);
}

.description-sort-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.list-description {
  font-size: 0.8rem;
  color: rgb(170, 170, 170);
  max-width: 65%;
}

.sort-controls {
  display: flex;
  gap: 0.3rem;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(150, 150, 150);
}

.sort-controls label {
  text-transform: capitalize;
}

.sort-controls select {
  border-radius: 8px;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  color: rgb(200, 200, 200);
  background-color: var(--color-background);
  padding: 0 0.4rem;
}

.icon {
  width: 10px;
  height: 10px;
  stroke-width: 3px;
  stroke: currentColor;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.comments-section {
  margin-top: 2rem;
}

.comments-section h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: rgb(200, 200, 200);
}

.placeholder-comment {
  font-size: 0.9rem;
  color: rgb(140, 140, 140);
}
</style>
