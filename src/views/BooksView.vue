<template>
  <div class="books-view">
    <div class="sort-container">
      <p class="books-label">Books</p>
      <div class="sort-controls">
        <label for="sort">sort by</label>
        <select id="sort" v-model="selectedSort">
          <option value="newest">Publication Date (Newest First)</option>
          <option value="oldest">Publication Date (Oldest First)</option>
          <option value="az">Book Name (Alphabetical)</option>
          <option value="za">Book Name (Reverse Alphabetical)</option>
          <option value="rating-high">Average Rating (Highest First)</option>
          <option value="rating-low">Average Rating (Lowest First)</option>
          <option value="reviews-high">Number of Reviews (Highest First)</option>
          <option value="reviews-low">Number of Reviews (Lowest First)</option>
          <option value="ratings-high">Number of Ratings (Highest First)</option>
          <option value="ratings-low">Number of Ratings (Lowest First)</option>
        </select>
      </div>
    </div>

    <div class="books-grid">
      <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BookCard from '@/components/BookCard.vue'
import api from '@/api/api.js'

const selectedSort = ref('newest')
const books = ref([])

const fetchBooks = async () => {
  try {
    const response = await api.get('/books')
    console.log('got books')
    books.value = response.data
  } catch (error) {
    console.error('Error fetching books:', error)
  }
}

onMounted(fetchBooks)

const sortedBooks = computed(() => {
  const copy = [...books.value]
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
    case 'reviews-high':
      return copy.sort((a, b) => b.numberOfReviews - a.numberOfReviews)
    case 'reviews-low':
      return copy.sort((a, b) => a.numberOfReviews - b.numberOfReviews)
    case 'ratings-high':
      return copy.sort((a, b) => b.numberOfRatings - a.numberOfRatings)
    case 'ratings-low':
      return copy.sort((a, b) => a.numberOfRatings - b.numberOfRatings)
    default:
      return copy
  }
})
</script>

<style scoped>
.books-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  color: rgb(200, 200, 200); /* same as .nav-left color */
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif; /* system font stack */
}

.books-label {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: rgb(200, 200, 200);
  font-family: inherit;
}

.sort-controls {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  margin-bottom: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(150, 150, 150);
  font-family: inherit;
  background-color: var(--color-background);
}

.sort-controls label {
  text-transform: capitalize;
}

.sort-controls select {
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 0 0.5rem -0.2rem 0.3rem;
  font-family: inherit;
  font-size: inherit;
  color: rgb(200, 200, 200);
  background-color: var(--color-background);
}

.sort-controls select option:hover {
  color: white !important;
  background-color: transparent !important;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  justify-content: start;
}

.sort-container {
  display: flex;
  justify-content: space-between;
  align-items: center; /* vertically center the contents */
  border-bottom: 1px solid rgb(100, 100, 100);
  padding-bottom: 0; /* remove bottom padding */
  margin-bottom: 1.5rem; /* space between sort and grid */
  height: 40px; /* optionally fix height to dropdown height */
}
</style>
