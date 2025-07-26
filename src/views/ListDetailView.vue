<template>
  <div class="list-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading list details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchListDetails" class="retry-btn">Try Again</button>
    </div>

    <!-- List content -->
    <div v-else>
    <div class="list-info-total">
      <div class="title-user-row">
        <h1 class="list-title">{{ list.name }}</h1>
        <span class="list-user-info">
          by
          <router-link :to="`/profiles/${list.userId}`" class="list-user">
              {{ list.username }}
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
        <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" :bookListId="list.id" @bookDeleted="fetchListDetails" @logBook="openLogBookModal" :isLiked="isBookLiked(book.id)" @bookLiked="handleBookLiked" />
    </div>

      <!-- Add Book button -->
      <div class="add-book-container">
        <button class="add-book-btn" @click="handleAddBook">
          <Plus class="icon" /> Add Book
        </button>
    </div>

          <!-- Reviews Section -->
      <div class="reviews-section">
        <div class="reviews-header">
          <h2>Reviews ({{ reviews.length }})</h2>
          <button class="add-review-btn" @click="showAddReviewModal = true">
            <Plus class="icon" /> Add Review
          </button>
        </div>

        <div v-if="reviewsLoading" class="reviews-loading">
          <div class="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>

        <div v-else-if="reviews.length === 0" class="no-reviews">
          <MessageSquare class="icon" />
          <p>No reviews yet</p>
          <p class="no-reviews-subtitle">Be the first to share your thoughts!</p>
        </div>

        <div v-else class="reviews-list">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <div class="review-author">
                <span class="username">{{ review.username }}</span>
                <div class="rating">
                  <span 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ filled: star <= review.rating }"
                  >
                    ⭐
                  </span>
                </div>
              </div>
              <div class="review-actions">
                <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                <button 
                  v-if="isUserReview(review)"
                  class="delete-review-btn"
                  @click="deleteReview(review.id)"
                  title="Delete review"
                >
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
            
            <h3 class="review-title">{{ review.title }}</h3>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>
      </div>

      <!-- Add Review Modal -->
      <div v-if="showAddReviewModal" class="modal-overlay" @click="closeAddReviewModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Add Review</h2>
            <button class="close-btn" @click="closeAddReviewModal">
              <X class="icon" />
            </button>
          </div>
          <form class="modal-form" @submit.prevent="submitReview">
            <div class="form-group">
              <label for="reviewTitle">Review Title</label>
              <input 
                id="reviewTitle"
                v-model="newReview.title"
                type="text"
                placeholder="Give your review a title"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="reviewRating">Rating</label>
              <div class="rating-input">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="star-input"
                  :class="{ filled: star <= newReview.rating }"
                  @click="newReview.rating = star"
                >
                  ⭐
                </span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="reviewContent">Review Content</label>
              <textarea 
                id="reviewContent"
                v-model="newReview.content"
                placeholder="Share your thoughts about this list..."
                rows="6"
                required
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeAddReviewModal">Cancel</button>
              <button type="submit" class="submit-btn" :disabled="submittingReview">
                {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Book Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Add Book to List</h2>
            <button class="close-btn" @click="closeModal">
              <X class="icon" />
            </button>
          </div>
          <form class="modal-form" @submit.prevent="addBook">
            <div class="form-group">
              <label for="bookSearch">Search for a book</label>
              <div class="search-container">
                <input 
                  id="bookSearch" 
                  v-model="newBook.searchTerm" 
                  type="text" 
                  placeholder="Enter book title, author, or ISBN"
                  @input="handleSearch"
                  @focus="showSuggestions = true"
                  @blur="handleBlur"
                  autocomplete="off"
                />
                <!-- Search Suggestions Dropdown -->
                <div v-if="showSuggestions && filteredBooks.length > 0" class="suggestions-dropdown">
                  <div 
                    v-for="book in filteredBooks.slice(0, 5)" 
                    :key="book.id"
                    class="suggestion-item"
                    @mousedown="selectBook(book)"
                  >
                    <div class="suggestion-content">
                      <div class="book-title">{{ book.title }}</div>
                      <div class="book-author">{{ book.author || 'Unknown Author' }}</div>
                      <div class="book-year">{{ book.firstPublishedYear }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Books Overview -->
            <div v-if="selectedBooks.length > 0" class="selected-books-section">
              <h3>Books to Add ({{ selectedBooks.length }})</h3>
              <div class="selected-books-list">
                <div 
                  v-for="(book, index) in selectedBooks" 
                  :key="book.workId || book.id"
                  class="selected-book-item"
                >
                  <div class="selected-book-info">
                    <div class="selected-book-title">{{ book.title }}</div>
                    <div class="selected-book-author">{{ book.author || 'Unknown Author' }}</div>
                  </div>
                  <button 
                    type="button" 
                    class="remove-book-btn"
                    @click="removeSelectedBook(index)"
                  >
                    <X class="icon" />
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
              <button type="submit" class="add-btn" :disabled="selectedBooks.length === 0">
                Add {{ selectedBooks.length }} Book{{ selectedBooks.length !== 1 ? 's' : '' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Book Review Modal -->
      <div v-if="showBookReviewModal" class="modal-overlay" @click="closeBookReviewModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Add Book Review</h2>
            <button class="close-btn" @click="closeBookReviewModal">
              <X class="icon" />
            </button>
          </div>
          <form class="modal-form" @submit.prevent="submitBookReview">
            <div class="form-group">
              <label for="bookReviewTitle">Review Title</label>
              <input 
                id="bookReviewTitle"
                v-model="bookReview.title"
                type="text"
                placeholder="Give your review a title"
                required
              />
            </div>
            <div class="form-group">
              <label for="bookReviewRating">Rating</label>
              <div class="rating-input">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="star-input"
                  :class="{ filled: star <= bookReview.rating }"
                  @click="bookReview.rating = star"
                >
                  ⭐
                </span>
              </div>
            </div>
            <div class="form-group">
              <label for="bookReviewContent">Review Content</label>
              <textarea 
                id="bookReviewContent"
                v-model="bookReview.content"
                placeholder="Share your thoughts about this book..."
                rows="6"
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeBookReviewModal">Cancel</button>
              <button type="submit" class="submit-btn" :disabled="submittingBookReview">
                {{ submittingBookReview ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import { Heart, Book, Plus, X, MessageSquare, Trash2 } from 'lucide-vue-next'
import api from '@/api/api.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotification } from '@/composables/useNotification.js'
import { cleanBookId } from '@/utils/book.js'
import { findOrCreateLikedList } from '@/composables/useReviewedList.js'
import { useLikedList } from '@/composables/useLikedList.js'


const route = useRoute()
const { isLoggedIn } = useAuth()
const { showError, showConfirm, showSuccess } = useNotification()

const selectedSort = ref('az')
const list = ref({
  id: 0,
  name: '',
  userId: '',
  username: '',
  description: '',
  likes: 0,
  comments: 0,
  booksCount: 0,
  books: []
})
const loading = ref(false)
const error = ref(null)
const showAddModal = ref(false)
const newBook = ref({
  searchTerm: '',
  workId: ''
})
const showSuggestions = ref(false)
const filteredBooks = ref([])
const selectedBooks = ref([])

// Reviews data
const reviews = ref([])
const reviewsLoading = ref(false)
const showAddReviewModal = ref(false)
const submittingReview = ref(false)
const newReview = ref({
  title: '',
  content: '',
  rating: 0
})
const selectedBookForReview = ref(null)

// Add this in <template> after the existing Add Review Modal
const showBookReviewModal = ref(false)
const submittingBookReview = ref(false)
const bookReview = ref({
  title: '',
  content: '',
  rating: 0
})
const selectedBookForBookReview = ref(null)

const bookReviews = ref([])
// Remove likedBookIds, handleBookLiked, and liked list fetching logic
// In template, restore BookCard usage to:
// <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" :bookListId="list.id" @bookDeleted="fetchListDetails" @logBook="openLogBookModal" :isLiked="isBookLiked(book.id)" />

async function fetchBookReviews(bookId) {
  bookReviews.value = []
  if (!bookId) return
  try {
    const response = await api.get(`/reviews/books/${cleanBookId(bookId)}`)
    bookReviews.value = response.data
  } catch (err) {
    // Optionally handle error
    bookReviews.value = []
  }
}

function openLogBookModal(book) {
  selectedBookForBookReview.value = book
  showBookReviewModal.value = true
  bookReview.value.title = ''
  bookReview.value.content = ''
  bookReview.value.rating = 0
}
function closeBookReviewModal() {
  showBookReviewModal.value = false
  selectedBookForBookReview.value = null
  bookReview.value.title = ''
  bookReview.value.content = ''
  bookReview.value.rating = 0
}
async function submitBookReview() {
  if (!bookReview.value.title || !bookReview.value.content || bookReview.value.rating === 0) {
    showError('Validation Error', 'Please fill in all fields and select a rating')
    return
  }
  submittingBookReview.value = true
  try {
    let cleanBookIdVal = cleanBookId(selectedBookForBookReview.value.id)
    const reviewData = {
      reviewableType: 'BOOK',
      reviewableId: cleanBookIdVal,
      title: bookReview.value.title,
      content: bookReview.value.content,
      rating: bookReview.value.rating
    }
    await api.post('/reviews', reviewData)
    showSuccess('Review Added', 'Your review has been added to the book!')
    await fetchBookReviews(cleanBookIdVal)
    closeBookReviewModal()
    // Optionally, add the book to Books I've Reviewed list as before
    try {
      const listsResponse = await api.get('/openlibrary/booklists')
      const profileUsername = localStorage.getItem('username')
      const reviewedList = listsResponse.data.find(list => list.name === "Books I've Reviewed" && (list.username === profileUsername || list.userId === profileUsername))
      if (reviewedList) {
        await api.post('/openlibrary/booklists/books', {
          bookListId: reviewedList.id,
          bookIds: [cleanBookIdVal]
        })
      }
    } catch (err) {
      // Ignore errors for this part
    }
  } catch (err) {
    showError('Error', 'Failed to add review. Please try again.')
  } finally {
    submittingBookReview.value = false
  }
}

// Search functionality
async function handleSearch() {
  const searchTerm = newBook.value.searchTerm.trim()
  
  if (searchTerm.length < 2) {
    filteredBooks.value = []
    showSuggestions.value = false
    return
  }

  try {
    const response = await api.get('/openlibrary/suggestions', {
      params: {
        q: searchTerm,
        limit: 10
      }
    })
    
    // Extract suggestions from the API response
    filteredBooks.value = response.data.suggestions || []
    showSuggestions.value = filteredBooks.value.length > 0
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    filteredBooks.value = []
    showSuggestions.value = false
  }
}

// Handle input blur with delay to allow clicking on suggestions
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Select a book from suggestions
function selectBook(book) {
  // Extract workId from the API response structure
  // API returns id like '/works/OL82586W', we need to clean it
  let workId = book.id
  if (typeof workId === 'string' && workId.startsWith('/works/')) {
    workId = workId.replace('/works/', '')
  }
  if (typeof workId === 'string' && workId.startsWith('/')) {
    workId = workId.substring(1)
  }
  
  // Check if book is already selected
  const isAlreadySelected = selectedBooks.value.some(selectedBook => {
    const selectedWorkId = selectedBook.workId || selectedBook.id
    return selectedWorkId === workId
  })
  
  if (!isAlreadySelected) {
    // Ensure the book has a workId for API calls
    const bookWithWorkId = {
      ...book,
      workId: workId
    }
    selectedBooks.value.push(bookWithWorkId)
  }
  
  // Clear search input and suggestions
  newBook.value.searchTerm = ''
  showSuggestions.value = false
  filteredBooks.value = []
}

// Remove a selected book
function removeSelectedBook(index) {
  selectedBooks.value.splice(index, 1)
}

// Fetch list details from API
async function fetchListDetails() {
  const listId = route.params.id
  
  if (!listId) {
    error.value = 'No list ID provided'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('📚 Fetching list details for ID:', listId)
    const response = await api.get(`/openlibrary/booklists/${listId}`)
    console.log('📥 API Response:', response.data)
    
    // Map the API response to match your expected list structure
    const apiList = response.data
    
    list.value = {
      id: apiList.id,
      name: apiList.name,
      userId: apiList.username || apiList.userId,
      username: apiList.username || apiList.userId,
      description: apiList.description || `A collection of ${apiList.books?.length || 0} books`,
      likes: apiList.likes || 0,
      comments: apiList.comments || 0,
      booksCount: apiList.books?.length || apiList.bookIds?.length || 0,
      books: apiList.books?.map(book => {
        let bookId = book.bookId || book.id || book.isbn || 0;
        if (typeof bookId === 'string' && bookId.startsWith('/works/')) {
          bookId = bookId.replace('/works/', '');
        }
        if (typeof bookId === 'string' && bookId.startsWith('/')) {
          bookId = bookId.substring(1);
        }
        return {
          id: bookId,
          title: book.title,
          coverId: book.coverId, // Add coverId mapping
          coverUrl: book.coverUrl || book.cover_url || '/src/assets/cover.jpg',
          authors: book.authors?.map(author => author.name).join(', ') || 'Unknown Author',
          summary: book.summaries?.[0] || book.summary || '',
          subjects: book.subjects || [],
          languages: book.languages || ['en'],
          downloadCount: book.download_count || 0,
          publicationYear: book.publicationYear || book.publication_year || 0,
          averageRating: book.averageRating || book.average_rating || 0,
          numberOfReads: book.numberOfReads || book.number_of_reads || 0,
          numberOfLogs: book.numberOfLogs || book.number_of_logs || 0,
          numberOfReviews: book.numberOfReviews || book.number_of_reviews || 0,
          numberOfRatings: book.numberOfRatings || book.number_of_ratings || 0,
          genres: book.subjects?.slice(0, 3) || [],
          pageCount: book.pageCount || book.page_count || book.pages || 0
        }
      }) || []
    }
    
    console.log('📚 Mapped list:', list.value)
  } catch (err) {
    console.error('❌ Error fetching list details:', err)
    
    if (err.response?.status === 403) {
      error.value = 'Access denied. Please log in to view this list.'
    } else if (err.response?.status === 404) {
      error.value = 'List not found.'
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch list details'
    }
  } finally {
    loading.value = false
  }
}

// Handle Add Book button click
function handleAddBook() {
  showAddModal.value = true
  selectedBooks.value = [] // Clear selected books when opening modal
}

// Close Add Book Modal
function closeModal() {
  showAddModal.value = false
  newBook.value = {
    searchTerm: '',
    workId: ''
  }
  selectedBooks.value = []
}

// Add book to list
async function addBook() {
  if (selectedBooks.value.length === 0) {
    showError('Please select at least one book to add!')
    return
  }

  try {
    const workIds = selectedBooks.value.map(book => {
      // Use the workId that was cleaned when the book was selected
      return book.workId
    })
    
    const requestBody = {
      bookListId: parseInt(route.params.id),
      bookIds: workIds
    }

    console.log('➕ Adding books to list:', workIds)
    const response = await api.post('/openlibrary/booklists/books', requestBody)
    console.log('📥 API Response:', response.data)

    // Clear selected books
    selectedBooks.value = []
    
    await fetchListDetails() // Refresh list details to show updated book count
    closeModal()
  } catch (err) {
    console.error('❌ Error adding book:', err)
    showError('Failed to add book. Please try again.')
  }
}

const profileUsername = localStorage.getItem('username')
const { likedBookIds, isBookLiked, fetchLikedList } = useLikedList(profileUsername)

function handleBookLiked(cleanedId) {
  likedBookIds.value = new Set([...likedBookIds.value, String(cleanedId)])
}

// Remove handleBookLiked and @bookLiked from BookCard
// In template, restore BookCard usage to:
// <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" :bookListId="list.id" @bookDeleted="fetchListDetails" @logBook="openLogBookModal" :isLiked="isBookLiked(book.id)" />

onMounted(async () => {
  if (!isLoggedIn.value) {
    error.value = 'Please log in to view list details.'
    return
  }
  await fetchListDetails()
  await fetchReviews()
  await fetchLikedList()
  // Debug: log liked book IDs
  console.log('Liked book IDs:', Array.from(likedBookIds.value))
  // Debug: log each book's like status
  sortedBooks.value.forEach(book => {
    console.log(
      `Book: ${book.title} | Raw ID: ${book.id} | Cleaned ID: ${cleanBookId(book.id)} | isLiked: ${isBookLiked(book.id)}`
    )
  })
})

const sortedBooks = computed(() => {
  const copy = [...list.value.books]

  switch (selectedSort.value) {
    case 'newest':
      return copy.sort((a, b) => b.publicationYear - a.publicationYear)
    case 'oldest':
      return copy.sort((a, b) => a.publicationYear - b.publicationYear)
    case 'az':
      return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'za':
      return copy.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
    case 'rating-high':
      return copy.sort((a, b) => b.averageRating - a.averageRating)
    case 'rating-low':
      return copy.sort((a, b) => a.averageRating - b.averageRating)
    default:
      return copy
  }
})

// Fetch reviews for the list
async function fetchReviews() {
  if (!list.value.id) return
  
  reviewsLoading.value = true
  
  try {
    const response = await api.get(`/reviews/booklists/${list.value.id}`)
    reviews.value = response.data
  } catch (err) {
    console.error('❌ Error fetching reviews:', err)
    // Don't show error for reviews, just log it
  } finally {
    reviewsLoading.value = false
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  
  return date.toLocaleDateString()
}

// Check if review belongs to current user
function isUserReview(review) {
  const currentUsername = localStorage.getItem('username')
  return review.username === currentUsername
}

// Delete review
async function deleteReview(reviewId) {
  const confirmed = await showConfirm(
    'Delete Review',
    'Are you sure you want to delete this review? This action cannot be undone.'
  )
  
  if (!confirmed) {
    return
  }
  
  try {
    const response = await api.post('/reviews/delete', {
      reviewId: reviewId
    })
    
    // Refresh reviews after successful deletion
    await fetchReviews()
  } catch (err) {
    console.error('❌ Error deleting review:', err)
    showError('Error', 'Failed to delete review. Please try again.')
  }
}

// Close add review modal
function closeAddReviewModal() {
  showAddReviewModal.value = false
  newReview.value = {
    title: '',
    content: '',
    rating: 0
  }
  selectedBookForReview.value = null
}

// Submit new review
async function submitReview() {
  if (!newReview.value.title || !newReview.value.content || newReview.value.rating === 0) {
    showError('Validation Error', 'Please fill in all fields and select a rating')
    return
  }
  
  submittingReview.value = true
  
  try {
    const reviewData = {
      reviewableType: 'BOOK_LIST',
      reviewableId: list.value.id.toString(),
      title: newReview.value.title,
      content: newReview.value.content,
      rating: newReview.value.rating
    }
    
    const response = await api.post(`/reviews/booklists/${list.value.id}`, reviewData)
    
    // Refresh reviews
    await fetchReviews()
    
    // Close modal
    closeAddReviewModal()
  } catch (err) {
    console.error('❌ Error submitting review:', err)
    
    if (err.response?.status === 400) {
      showError('Bad Request', 'Please check your review and try again.')
    } else if (err.response?.status === 401) {
      showError('Unauthorized', 'Please log in to submit a review.')
    } else {
      showError('Error', 'Failed to submit review. Please try again.')
    }
  } finally {
    submittingReview.value = false
  }
}

// Remove likedBookIds, handleBookLiked, and liked list fetching logic
// In template, restore BookCard usage to:
// <BookCard v-for="book in sortedBooks" :key="book.id" :book="book" :bookListId="list.id" @bookDeleted="fetchListDetails" @logBook="openLogBookModal" :isLiked="isBookLiked(book.id)" />
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
  padding: 0.5rem;
  border: 1px solid rgb(100, 100, 100);
  border-radius: 4px;
  background-color: var(--color-background-dark);
  color: rgb(200, 200, 200);
  font-size: 0.9rem;
  font-family: inherit;
}

.add-book-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  white-space: nowrap;
}

.add-book-btn:hover {
  background: #005fa3;
}

.add-book-btn .icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow: visible;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(100, 100, 100);
  background-color: var(--color-background-dark);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: rgb(200, 200, 200);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: rgb(150, 150, 150);
}

.close-btn:hover {
  color: rgb(200, 200, 200);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  color: rgb(150, 150, 150);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.8rem 1rem;
  border: 1px solid rgb(100, 100, 100);
  border-radius: 6px;
  background-color: var(--color-background-dark);
  color: rgb(200, 200, 200);
  font-size: 0.9rem;
  font-family: inherit;
  resize: none;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0077cc;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn,
.add-btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.add-btn {
  background: #0077cc;
  color: white;
}

.add-btn:hover {
  background: #005fa3;
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

.add-book-container {
  text-align: center;
  margin-top: 1.5rem;
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

/* Search Suggestions Dropdown Styles */
.search-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: #23232b; /* solid, opaque dark background */
  border: 2px solid #22243a;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 8px 32px 8px rgba(0,0,0,0.45), 0 1.5px 4px rgba(0,0,0,0.18);
  z-index: 2000;

  /* Custom dark scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #44485a #23232b;
}

.suggestions-dropdown::-webkit-scrollbar {
  width: 10px;
}
.suggestions-dropdown::-webkit-scrollbar-track {
  background: #23232b;
  border-radius: 0 0 6px 6px;
}
.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: #44485a;
  border-radius: 6px;
}
.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: #55596a;
}

.suggestion-item {
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgb(80, 80, 80);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: rgb(60, 60, 60);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.book-title {
  font-weight: 500;
  color: rgb(200, 200, 200);
  font-size: 0.9rem;
}

.book-author {
  font-size: 0.75rem;
  color: rgb(160, 160, 160);
}

.book-year {
  font-size: 0.7rem;
  color: rgb(140, 140, 140);
}

/* Selected Books Overview Styles */
.selected-books-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(100, 100, 100);
}

.selected-books-section h3 {
  font-size: 1rem;
  color: rgb(200, 200, 200);
  margin-bottom: 0.5rem;
}

.selected-books-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  background-color: var(--color-background-dark);
  border-radius: 4px;
  border: 1px solid rgb(100, 100, 100);
}

.selected-book-info {
  display: flex;
  flex-direction: column;
}

.selected-book-title {
  font-weight: 500;
  color: rgb(200, 200, 200);
  font-size: 0.9rem;
}

.selected-book-author {
  font-size: 0.75rem;
  color: rgb(160, 160, 160);
}

.remove-book-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: rgb(150, 150, 150);
}

.remove-book-btn:hover {
  color: rgb(200, 200, 200);
}

/* Reviews Section */
.reviews-section {
  margin-top: 2rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.reviews-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0;
}

.add-review-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-review-btn:hover {
  background: #005fa3;
}

.add-review-btn .icon {
  width: 16px;
  height: 16px;
}

.reviews-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: rgb(150, 150, 150);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgb(100, 100, 100);
  border-top: 3px solid #0077cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: rgb(140, 140, 140);
}

.no-reviews .icon {
  width: 64px;
  height: 64px;
  color: rgb(100, 100, 100);
  margin-bottom: 1rem;
}

.no-reviews p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.no-reviews-subtitle {
  font-size: 0.9rem !important;
  color: rgb(120, 120, 120) !important;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: rgb(30, 30, 40);
  border: 1px solid rgb(60, 60, 80);
  border-radius: 8px;
  padding: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.review-author {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.username {
  font-weight: 600;
  color: rgb(220, 220, 220);
  font-size: 1rem;
}

.rating {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 0.875rem;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.filled {
  opacity: 1;
}

.review-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.review-date {
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
}

.delete-review-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: rgb(150, 150, 150);
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-review-btn:hover {
  background: rgb(60, 60, 80);
  color: #e74c3c;
}

.delete-review-btn .icon {
  width: 16px;
  height: 16px;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 0.75rem 0;
}

.review-content {
  font-size: 0.95rem;
  color: rgb(180, 180, 180);
  line-height: 1.6;
  margin: 0;
}

/* Review Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: rgb(30, 30, 40);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgb(60, 60, 80);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: rgb(220, 220, 220);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: rgb(150, 150, 150);
}

.close-btn:hover {
  color: rgb(200, 200, 200);
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgb(200, 200, 200);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgb(40, 40, 50);
  border: 1px solid rgb(60, 60, 80);
  border-radius: 4px;
  color: rgb(200, 200, 200);
  font-family: inherit;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0077cc;
}

.rating-input {
  display: flex;
  gap: 0.5rem;
}

.star-input {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star-input.filled {
  opacity: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background: rgb(60, 60, 80);
  color: rgb(200, 200, 200);
}

.cancel-btn:hover {
  background: rgb(80, 80, 100);
}

.submit-btn {
  background: #0077cc;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #005fa3;
}

.submit-btn:disabled {
  background: rgb(60, 60, 80);
  cursor: not-allowed;
}
</style>
