<template>
  <div class="search-view">
    <div class="search-container">
      <h1 class="search-title">Search Books</h1>
      
      <!-- Search Input -->
      <div class="search-input-container">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for books, authors, or subjects..."
            class="search-input"
            @keyup.enter="performSearch"
            @input="handleSearchInput"
          />
          <button 
            @click="performSearch" 
            :disabled="!searchQuery.trim() || searching"
            class="search-button"
          >
            {{ searching ? 'Searching...' : 'Search' }}
          </button>
        </div>
        
        <!-- Search Filters -->
                 <div class="search-filters">
           <div class="filter-group">
             <label for="searchType">Search in:</label>
             <select v-model="searchType" id="searchType" class="filter-select">
               <option value="all">All Fields</option>
               <option value="title">Title</option>
               <option value="author">Author (Books by Author)</option>
               <option value="author_search">Author Search</option>
               <option value="subject">Subject</option>
             </select>
           </div>
           
           <div class="filter-group">
             <label for="limit">Results per page:</label>
             <select v-model="limit" id="limit" class="filter-select">
               <option value="10">10</option>
               <option value="20">20</option>
               <option value="50">50</option>
               <option value="100">100</option>
             </select>
           </div>
           
           <div v-if="searchType === 'author_search'" class="filter-group">
             <label for="sortOrder">Sort by:</label>
             <select v-model="sortOrder" id="sortOrder" class="filter-select">
               <option value="relevance">Relevance</option>
               <option value="title">Title</option>
               <option value="year">Publication Year</option>
             </select>
           </div>
         </div>
      </div>
      
      <!-- Search Results -->
      <div class="search-results">
        <!-- Loading State -->
        <div v-if="searching" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Searching for books...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <AlertCircle class="error-icon" />
          <h3>Search Error</h3>
          <p>{{ error }}</p>
          <button @click="performSearch" class="retry-button">Try Again</button>
        </div>
        
        <!-- No Results -->
        <div v-else-if="searchPerformed && results.length === 0" class="no-results">
          <BookOpen class="no-results-icon" />
          <h3>No books found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
        
        <!-- Search Results -->
        <div v-else-if="results.length > 0" class="results-container">
          <div class="results-header">
            <h2>Search Results</h2>
            <p class="results-count">
              Found {{ totalResults }} books{{ searchQuery ? ` for "${searchQuery}"` : '' }}
            </p>
          </div>
          
          <div class="results-grid">
            <BookCard 
              v-for="book in results" 
              :key="book.id" 
              :book="book"
              @click="selectBook(book)"
            />
          </div>
          
          <!-- Pagination (only for regular search, not author search) -->
          <div v-if="totalResults > limit && searchType !== 'author_search'" class="pagination">
            <button 
              @click="changePage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="page-button"
            >
              Previous
            </button>
            
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="page-button"
            >
              Next
            </button>
          </div>
          
          <!-- Author search note -->
          <div v-if="searchType === 'author_search' && totalResults > limit" class="pagination-note">
            <p class="note-text">
              Showing {{ results.length }} of {{ totalResults }} books. 
              Adjust limit to see more results (max 100).
            </p>
          </div>
        </div>
        
        <!-- Welcome State -->
        <div v-else class="welcome-state">
          <Search class="welcome-icon" />
          <h3>Search our library</h3>
          <p>Enter a book title, author name, or subject to get started</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, BookOpen, AlertCircle } from 'lucide-vue-next'
import BookCard from '@/components/BookCard.vue'
import api from '@/api/api.js'
import { useNotification } from '@/composables/useNotification.js'

const route = useRoute()
const router = useRouter()
const { showError } = useNotification()

// Search state
const searchQuery = ref('')
const searchType = ref('all')
const sortOrder = ref('relevance')
const limit = ref(20)
const currentPage = ref(1)
const searching = ref(false)
const searchPerformed = ref(false)
const error = ref(null)

// Results state
const results = ref([])
const totalResults = ref(0)
const responseTime = ref(0)

// Computed properties
const totalPages = computed(() => Math.ceil(totalResults.value / limit.value))

// Search functionality
async function performSearch() {
  if (!searchQuery.value.trim()) {
    showError('Please enter a search term')
    return
  }
  
  searching.value = true
  error.value = null
  searchPerformed.value = true
  
  try {
    console.log('🔍 Performing search:', {
      query: searchQuery.value,
      type: searchType.value,
      sort: sortOrder.value,
      limit: limit.value,
      page: currentPage.value
    })
    
    let response
    
    if (searchType.value === 'author_search') {
      // Use author search endpoint
      const params = {
        name: searchQuery.value.trim(),
        limit: Math.min(limit.value, 100), // Limit to maximum 100
        sort: sortOrder.value
      }
      
      console.log('🌐 Author Search API Request params:', params)
      response = await api.get('/openlibrary/search/author', { params })
    } else {
      // Use regular book search endpoint
      const params = {
        q: searchQuery.value.trim(),
        limit: Math.min(limit.value, 100), // Limit to maximum 100
        offset: (currentPage.value - 1) * limit.value
      }
      
      // Add search type filter if not 'all' - adjust field names for Open Library
      if (searchType.value !== 'all') {
        switch (searchType.value) {
          case 'title':
            params.q = `title:(${searchQuery.value.trim()})`
            break
          case 'author':
            params.q = `author:(${searchQuery.value.trim()})`
            break
          case 'subject':
            params.q = `subject:(${searchQuery.value.trim()})`
            break
        }
      }
      
      console.log('🌐 Book Search API Request params:', params)
      response = await api.get('/openlibrary/search', { params })
    }
    
    console.log('📥 Search API Response:', response.data)
    
    let searchResults = []
    
    if (searchType.value === 'author_search') {
      // Handle author search response format
      searchResults = response.data.suggestions || []
      results.value = searchResults.map(book => {
        // Extract work ID from key or id
        const workId = book.key ? book.key.replace('/works/', '') : book.id
        
        return {
          id: workId,
          title: book.title || 'Untitled',
          authors: book.author || 'Unknown Author',
          coverId: book.coverId,
          summary: '',
          subjects: [],
          publicationYear: book.firstPublishedYear,
          averageRating: 0,
          numberOfReviews: 0,
          pageCount: 0,
          editionCount: 0,
          language: []
        }
      })
      
      totalResults.value = response.data.totalResults || searchResults.length
    } else {
      // Handle regular book search response format - Open Library format
      searchResults = response.data.docs || []
      results.value = searchResults.map(book => {
        // Extract work ID from key (e.g., "/works/OL82563W" -> "OL82563W")
        const workId = book.key ? book.key.replace('/works/', '') : book.id
        
        return {
          id: workId,
          title: book.title || 'Untitled',
          authors: Array.isArray(book.author_name) 
            ? book.author_name.join(', ')
            : 'Unknown Author',
          coverId: book.cover_i, // Open Library uses cover_i for cover ID
          summary: book.summary || book.description || '',
          subjects: book.subject || [],
          publicationYear: book.first_publish_year,
          averageRating: 0, // Not available in Open Library search
          numberOfReviews: 0, // Not available in Open Library search
          pageCount: 0, // Not available in Open Library search
          editionCount: book.edition_count || 0,
          language: book.language || []
        }
      })
      
      totalResults.value = response.data.numFound || response.data.num_found || searchResults.length
    }
    responseTime.value = response.data.responseTime || 0
    
    console.log('📚 Mapped search results:', results.value)
    console.log('📊 Total results found:', totalResults.value)
    
    // Update URL with search params
    updateURL()
    
  } catch (err) {
    console.error('❌ Search error:', err)
    error.value = err.response?.data?.message || 'Failed to search books. Please try again.'
  } finally {
    searching.value = false
  }
}

// Handle search input with debouncing
let searchTimeout
function handleSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length >= 3) {
      currentPage.value = 1
      // Optionally auto-search on input
      // performSearch()
    }
  }, 500)
}

// Pagination
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    performSearch()
    // Scroll to top of results
    document.querySelector('.search-results')?.scrollIntoView({ behavior: 'smooth' })
  }
}

// Book selection
function selectBook(book) {
  // Store book data for BookDetailView
  localStorage.setItem('currentBookData', JSON.stringify(book))
  router.push(`/books/${book.id}`)
}

// URL management
function updateURL() {
  const query = {
    q: searchQuery.value,
    type: searchType.value !== 'all' ? searchType.value : undefined,
    sort: (searchType.value === 'author_search' && sortOrder.value !== 'relevance') ? sortOrder.value : undefined,
    limit: limit.value !== 20 ? limit.value : undefined,
    page: currentPage.value !== 1 ? currentPage.value : undefined
  }
  
  // Remove undefined values
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) {
      delete query[key]
    }
  })
  
  router.replace({ query })
}

function loadFromURL() {
  const urlParams = route.query
  
  if (urlParams.q) {
    searchQuery.value = urlParams.q
    searchType.value = urlParams.type || 'all'
    sortOrder.value = urlParams.sort || 'relevance'
    limit.value = parseInt(urlParams.limit) || 20
    currentPage.value = parseInt(urlParams.page) || 1
    
    // Perform search with URL parameters
    performSearch()
  }
}

// Clear search
function clearSearch() {
  searchQuery.value = ''
  searchType.value = 'all'
  sortOrder.value = 'relevance'
  currentPage.value = 1
  results.value = []
  totalResults.value = 0
  searchPerformed.value = false
  error.value = null
  router.replace({ query: {} })
}

// Lifecycle
onMounted(() => {
  loadFromURL()
})
</script>

<style scoped>
.search-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: rgb(200, 200, 200);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-title {
  text-align: center;
  margin-bottom: 1rem;
  color: rgb(230, 230, 230);
}

/* Search Input */
.search-input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background: rgb(30, 30, 35);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgb(60, 60, 60);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: rgb(150, 150, 150);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: rgb(200, 200, 200);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: rgb(120, 120, 120);
}

.search-button {
  padding: 0.5rem 1rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background: #005fa3;
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Search Filters */
.search-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: rgb(180, 180, 180);
  white-space: nowrap;
}

.filter-select {
  background: rgb(40, 40, 45);
  border: 1px solid rgb(60, 60, 60);
  color: rgb(200, 200, 200);
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.9rem;
}



/* States */
.loading-state,
.error-state,
.no-results,
.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  color: rgb(150, 150, 150);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: #0077cc;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.no-results-icon,
.welcome-icon {
  width: 48px;
  height: 48px;
  color: rgb(120, 120, 120);
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Results */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.results-header {
  text-align: center;
}

.results-count {
  color: rgb(150, 150, 150);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-button {
  padding: 0.5rem 1rem;
  background: rgb(40, 40, 45);
  border: 1px solid rgb(60, 60, 60);
  color: rgb(200, 200, 200);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-button:hover:not(:disabled) {
  background: rgb(50, 50, 55);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgb(150, 150, 150);
  font-size: 0.9rem;
}

.pagination-note {
  text-align: center;
  margin-top: 1rem;
}

.note-text {
  color: rgb(150, 150, 150);
  font-size: 0.9rem;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
