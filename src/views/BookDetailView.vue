<template>
  <div class="book-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading book details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchBookDetails" class="retry-btn">Try Again</button>
    </div>

    <!-- Book content -->
    <div v-else class="book-content">
      <!-- Header section -->
      <div class="book-header">
        <div class="book-cover">
          <div v-if="coverLoading" class="cover-loading">
            <div class="loading-spinner"></div>
            <p>Loading cover...</p>
          </div>
          <CachedImage
            v-else
            :src="coverUrl"
            :alt="book.title"
            image-class="cover-image"
          />
        </div>
        <div class="book-info">
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author" v-if="book.authors && book.authors.length > 0">
            by {{ book.authors.join(', ') }}
          </p>
          <p class="book-author" v-else>Author information not available</p>
          
          <div class="book-meta">
            <span class="meta-item" v-if="book.languages && book.languages.length > 0">
              <Globe class="icon" /> {{ book.languages.join(', ') }}
            </span>
            <span class="meta-item" v-if="book.mediaType">
              <FileText class="icon" /> {{ book.mediaType }}
            </span>
            <span class="meta-item" v-if="book.downloadCount !== undefined">
              <Download class="icon" /> {{ book.downloadCount }} downloads
            </span>
          </div>
        </div>
      </div>

      <!-- Summary section -->
      <div class="book-summary" v-if="book.summary">
        <h2>Summary</h2>
        <p>{{ book.summary }}</p>
      </div>

      <!-- Subjects/Tags section -->
      <div class="book-subjects" v-if="book.subjects && book.subjects.length > 0">
        <h2>Subjects & Tags</h2>
        <div class="subjects-grid">
          <span 
            v-for="subject in book.subjects" 
            :key="subject" 
            class="subject-tag"
          >
            {{ subject }}
          </span>
        </div>
      </div>

      <!-- Additional details -->
      <div class="book-details" v-if="hasAdditionalDetails">
        <h2>Additional Details</h2>
        <div class="details-grid">
          <div class="detail-item" v-if="book.copyright">
            <strong>Copyright:</strong> {{ book.copyright }}
          </div>
          <div class="detail-item" v-if="book.translators && book.translators.length > 0">
            <strong>Translators:</strong> {{ book.translators.join(', ') }}
          </div>
          <div class="detail-item" v-if="book.bookshelves && book.bookshelves.length > 0">
            <strong>Bookshelves:</strong> {{ book.bookshelves.join(', ') }}
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="book-actions">
        <button class="action-btn primary">
          <BookOpen class="icon" /> Read Book
        </button>
        <button class="action-btn secondary">
          <Heart class="icon" /> Add to Wishlist
        </button>
        <button class="action-btn secondary" @click="showAddReviewModal = true">
          <Plus class="icon" /> Log Reading
        </button>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <div class="reviews-header">
          <h2>Reviews ({{ reviews.length }})</h2>
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
                placeholder="Share your thoughts about this book..."
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Globe, 
  FileText, 
  Download, 
  BookOpen, 
  Heart, 
  Plus,
  MessageSquare,
  X,
  Trash2
} from 'lucide-vue-next'
import api from '@/api/api.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotification } from '@/composables/useNotification.js'
import { cleanBookId } from '@/utils/book.js'
import { findReviewedList, addBookToReviewedList, removeBookFromReviewedList } from '@/composables/useReviewedList.js'

import CachedImage from '@/components/CachedImage.vue'

const route = useRoute()
const { isLoggedIn } = useAuth()
const { showError, showConfirm, hideNotification } = useNotification()

const book = ref({
  id: 0,
  title: '',
  authors: [],
  summary: '',
  subjects: [],
  languages: [],
  mediaType: '',
  downloadCount: 0,
  copyright: null,
  translators: null,
  bookshelves: null,
  coverId: null, // Add coverId to initial state
  coverUrl: '/src/assets/cover.jpg'
})
const loading = ref(false)
const error = ref(null)

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

// Check if book has additional details to show
const hasAdditionalDetails = computed(() => {
  return book.value.copyright || 
         (book.value.translators && book.value.translators.length > 0) ||
         (book.value.bookshelves && book.value.bookshelves.length > 0)
})

// Fetch book details from API
async function fetchBookDetails() {
  // Check if we have stored book data first
  const storedBookData = localStorage.getItem('currentBookData')
  let bookId = route.params.id
  
  if (storedBookData) {
    try {
      const parsedData = JSON.parse(storedBookData)
      
      // Use the stored book ID if it's valid
      if (parsedData.id && parsedData.id !== 0) {
        bookId = parsedData.id
      }
    } catch (error) {
      console.error('❌ Error parsing stored book data:', error)
    }
  }
  
  if (!bookId) {
    error.value = 'No book ID provided'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await api.get(`/openlibrary/books/${bookId}`)
    
    // Map the API response to match your expected book structure
    const apiBook = response.data
    
    console.log('BookDetailView: API response coverId =', apiBook.coverId)
    
    book.value = {
      id: apiBook.bookId || apiBook.isbn || apiBook.id || 0, // Use bookId as primary identifier
      title: apiBook.title || 'Untitled',
      authors: apiBook.authors?.map(author => author.name) || [],
      summary: apiBook.summaries?.[0] || apiBook.summary || '',
      subjects: apiBook.subjects || [],
      languages: apiBook.languages || [],
      mediaType: apiBook.media_type || '',
      downloadCount: apiBook.download_count || 0,
      copyright: apiBook.copyright,
      translators: apiBook.translators,
      bookshelves: apiBook.bookshelves,
      coverId: apiBook.coverId, // Add coverId mapping
      coverUrl: apiBook.coverUrl || apiBook.cover_url || '/src/assets/cover.jpg'
    }
    
    console.log('BookDetailView: book.value.coverId set to =', book.value.coverId)
    
  } catch (err) {
    console.error('❌ Error fetching book details:', err)
    
    if (err.response?.status === 403) {
      error.value = 'Access denied. Please log in to view this book.'
    } else if (err.response?.status === 404) {
      error.value = 'Book not found.'
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch book details'
    }
  } finally {
    loading.value = false
  }
}

// Fetch reviews for the book
async function fetchReviews() {
  if (!book.value.id) return
  
  reviewsLoading.value = true
  
  try {
    // Clean the book ID to remove /works/ prefix
    let cleanedId = cleanBookId(book.value.id)
    
    const response = await api.get(`/reviews/books/${cleanedId}`)
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

// Close add review modal
function closeAddReviewModal() {
  showAddReviewModal.value = false
  newReview.value = {
    title: '',
    content: '',
    rating: 0
  }
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
    hideNotification()
    return
  }
  
  try {
    const response = await api.post('/reviews/delete', {
      reviewId: reviewId
    })
    
    // Refresh reviews after successful deletion
    await fetchReviews()
    // After successful review deletion, only remove book from 'Books I've Reviewed' list if user has no remaining reviews for this book
    try {
      const profileUsername = localStorage.getItem('username')
      const reviewedList = await findReviewedList(profileUsername)
      if (reviewedList) await removeBookFromReviewedList(reviewedList.id, book.value.id)
    } catch (err) {
      console.error('❌ Error removing book from Books I\'ve Reviewed list:', err)
    }
    hideNotification()
  } catch (err) {
    console.error('❌ Error deleting review:', err)
    showError('Error', 'Failed to delete review. Please try again.')
    hideNotification()
  }
}

// Submit new review
async function submitReview() {
  if (!newReview.value.title || !newReview.value.content || newReview.value.rating === 0) {
    showError('Validation Error', 'Please fill in all fields and select a rating')
    return
  }
  
  submittingReview.value = true
  
  try {
    // Clean the book ID to remove /works/ prefix
    let cleanedId = cleanBookId(book.value.id)
    
    const reviewData = {
      reviewableType: 'BOOK',
      reviewableId: cleanedId,
      title: newReview.value.title,
      content: newReview.value.content,
      rating: newReview.value.rating
    }
    
    const response = await api.post('/reviews', reviewData)
    
    // After successful review, add book to 'Books I've Reviewed' list
    try {
      const profileUsername = localStorage.getItem('username')
      const reviewedList = await findReviewedList(profileUsername)
      if (reviewedList) await addBookToReviewedList(reviewedList.id, book.value.id)
    } catch (err) {
      console.error('❌ Error adding book to Books I\'ve Reviewed list:', err)
    }
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

// Load book details when component mounts
onMounted(async () => {
  if (!isLoggedIn.value) {
    error.value = 'Please log in to view book details.'
    return
  }
  
  await fetchBookDetails()
  await fetchReviews()
  // Check if we should open the review modal automatically
  const openReviewModalForBook = localStorage.getItem('openReviewModalForBook')
  if (openReviewModalForBook && String(book.value.id) === String(openReviewModalForBook)) {
    showAddReviewModal.value = true
    localStorage.removeItem('openReviewModalForBook')
  }
})

// Alternative approach: Manual cover URL management
const coverUrl = ref('/src/assets/cover.jpg')
const coverLoading = ref(false)

// Watch for coverId changes and update cover URL manually
watch(() => book.value.coverId, async (newCoverId) => {
  console.log('BookDetailView: coverId changed to', newCoverId)
  
  if (!newCoverId || newCoverId <= 0) {
    coverUrl.value = '/src/assets/cover.jpg'
    coverLoading.value = false
    return
  }
  
  coverLoading.value = true
  
  try {
    // Generate cover URL
    const url = `https://covers.openlibrary.org/b/id/${newCoverId}-L.jpg`
    console.log('BookDetailView: Testing cover URL:', url)
    
    // Test if image exists
    const img = new Image()
    img.onload = () => {
      console.log('BookDetailView: Cover loaded successfully')
      coverUrl.value = url
      coverLoading.value = false
    }
    img.onerror = () => {
      console.log('BookDetailView: Cover failed to load, using default')
      coverUrl.value = '/src/assets/cover.jpg'
      coverLoading.value = false
    }
    img.src = url
    
  } catch (error) {
    console.error('BookDetailView: Error loading cover:', error)
    coverUrl.value = '/src/assets/cover.jpg'
    coverLoading.value = false
  }
}, { immediate: true })
</script>

<style scoped>
.book-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: rgb(200, 200, 200);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.loading, .error {
  text-align: center;
  padding: 3rem 1rem;
  color: rgb(150, 150, 150);
}

.error {
  color: #e74c3c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #005fa3;
}

.book-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header section */
.book-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgb(60, 60, 60);
}

.book-cover {
  flex-shrink: 0;
}

.cover-image {
  width: 200px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cover-loading {
  width: 200px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 8px;
  color: rgb(150, 150, 150);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0;
  line-height: 1.2;
}

.book-author {
  font-size: 1.1rem;
  color: rgb(160, 160, 160);
  margin: 0;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgb(140, 140, 140);
  padding: 0.25rem 0.75rem;
  background: rgb(40, 40, 40);
  border-radius: 4px;
}

.icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Summary section */
.book-summary h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
}

.book-summary p {
  font-size: 1rem;
  line-height: 1.6;
  color: rgb(180, 180, 180);
  margin: 0;
}

/* Subjects section */
.book-subjects h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
}

.subjects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subject-tag {
  padding: 0.25rem 0.75rem;
  background: rgb(40, 40, 40);
  color: rgb(160, 160, 160);
  border-radius: 4px;
  font-size: 0.85rem;
  transition: background-color 0.2s ease;
}

.subject-tag:hover {
  background: rgb(60, 60, 60);
  color: rgb(200, 200, 200);
}

/* Additional details */
.book-details h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  font-size: 0.95rem;
  color: rgb(180, 180, 180);
}

.detail-item strong {
  color: rgb(200, 200, 200);
  font-weight: 600;
}

/* Action buttons */
.book-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid rgb(60, 60, 60);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.action-btn.primary {
  background: #0077cc;
  color: white;
}

.action-btn.primary:hover {
  background: #005fa3;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: rgb(60, 60, 60);
  color: rgb(200, 200, 200);
}

.action-btn.secondary:hover {
  background: rgb(80, 80, 80);
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .cover-image {
    width: 150px;
    height: 210px;
  }
  
  .book-title {
    font-size: 1.5rem;
  }
  
  .book-actions {
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120px;
  }
}

/* Reviews Section */
.reviews-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgb(60, 60, 60);
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

.review-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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
