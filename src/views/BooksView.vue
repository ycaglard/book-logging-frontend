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

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading books...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchBooks" class="retry-btn">Try Again</button>
    </div>

    <!-- Books grid -->
    <div v-else class="books-grid">
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
const loading = ref(false)
const error = ref(null)

// Fetch books from API
async function fetchBooks() {
  loading.value = true
  error.value = null
  
  try {
    console.log('📚 Fetching books from API...')
    const response = await api.get('/books')
    console.log('📥 API Response:', response.data)
    
    // Map the API response to match your expected book structure
    books.value = response.data.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors || [],
      coverId: book.coverId, // Add coverId mapping
      coverUrl: book.coverUrl || book.cover_url || book.cover || '/src/assets/cover.jpg',
      pageCount: book.pageCount || book.page_count || book.pages || 0,
      publicationYear: book.publicationYear || book.publication_year || book.year || 0,
      languages: book.languages || ['en'],
      genres: book.genres || [],
      summary: book.summary || book.description || '',
      numberOfReads: book.numberOfReads || book.number_of_reads || book.reads || 0,
      numberOfLogs: book.numberOfLogs || book.number_of_logs || book.logs || 0,
      logs: book.logs || [],
      numberOfReviews: book.numberOfReviews || book.number_of_reviews || book.reviews || 0,
      reviews: book.reviews || [],
      numberOfRatings: book.numberOfRatings || book.number_of_ratings || book.ratings || 0,
      averageRating: book.averageRating || book.average_rating || book.rating || 0,
    }))
    
    console.log('📚 Mapped books:', books.value)
  } catch (err) {
    console.error('❌ Error fetching books:', err)
    error.value = err.response?.data?.message || 'Failed to fetch books'
  } finally {
    loading.value = false
  }
}

// Load books when component mounts
onMounted(() => {
  fetchBooks()
})

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

.loading {
  text-align: center;
  padding: 2rem;
  color: rgb(150, 150, 150);
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #005fa3;
}
</style>
