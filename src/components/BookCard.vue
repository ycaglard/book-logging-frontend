<template>
  <div class="book-card">
    <div class="cover-container">
      <RouterLink :to="`/books/${book.id}`" @click="storeBookData(book)">
        <CachedImage
          :src="coverUrl"
          :alt="book.title"
          image-class="book-cover"
          :show-loading="false"
        />
      </RouterLink>
      <div class="hover-actions">
        <button @click="logBook()">Log</button>
        <button v-if="!isLiked" @click="likeBook(book.id)">Like</button>
        <button class="delete-btn" @click="deleteBook(book.id)" title="Remove book">
          <XCircle class="delete-icon" />
        </button>
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
import { RouterLink, useRouter } from 'vue-router'
import { XCircle } from 'lucide-vue-next'
import api from '@/api/api.js'
import { useNotification } from '@/composables/useNotification.js'
import { useAuth } from '@/composables/useAuth.js'
import { findOrCreateLikedList, addBookToLikedList } from '@/composables/useReviewedList.js'
import { cleanBookId } from '@/utils/book.js'
import { useSimpleCoverUrl } from '@/composables/useCoverImage.js'
import CachedImage from '@/components/CachedImage.vue'
import { computed } from 'vue'

const { book, bookListId, isLiked } = defineProps({
  book: Object,
  bookListId: [String, Number],
  isLiked: Boolean
})
const emit = defineEmits(['bookDeleted', 'logBook', 'bookLiked'])

const storeBookData = (book) => {
  console.log('💾 Storing book data in localStorage:', book.title)
  localStorage.setItem('currentBookData', JSON.stringify({
    id: book.id,
    title: book.title,
    authors: book.authors,
    coverUrl: book.coverUrl,
    summary: book.summary,
    subjects: book.subjects,
    languages: book.languages,
    downloadCount: book.downloadCount
  }))
  console.log('✅ Book data stored successfully')
}

const router = useRouter()
const { showSuccess, showError } = useNotification()
const { isLoggedIn } = useAuth()

const logBook = () => {
  emit('logBook', book)
}

const likeBook = async (bookId) => {
  if (!isLoggedIn.value) {
    showError('Not logged in', 'Please log in to like a book.')
    return
  }
  try {
    const profileUsername = localStorage.getItem('username')
    const likedList = await findOrCreateLikedList(profileUsername)
    if (likedList) {
      await addBookToLikedList(likedList.id, book.id)
      showSuccess('Book Liked', `"${book.title}" has been added to your Books I Liked list.`)
      // Emit event to parent with cleaned book ID
      const cleanedId = book.id && typeof book.id === 'string' ? book.id.replace('/works/', '').replace(/^\//, '') : book.id
      emit('bookLiked', cleanedId)
    } else {
      showError('List Not Found', 'Could not find or create your Books I Liked list.')
    }
  } catch (err) {
    console.error('❌ Error liking book:', err)
    showError('Error', 'Failed to like book. Please try again.')
  }
}

const deleteBook = async (bookId) => {
  if (!bookListId) {
    alert('No book list ID provided!')
    return
  }
  try {
    // Delete all reviews for this book by the current user
    const profileUsername = localStorage.getItem('username')
    const cleanedId = book.id && typeof book.id === 'string' ? book.id.replace('/works/', '').replace(/^\//, '') : bookId
    const reviewsResponse = await api.get(`/reviews/books/${cleanedId}`)
    const userReviews = (reviewsResponse.data || []).filter(r => r.username === profileUsername)
    for (const review of userReviews) {
      await api.post('/reviews/delete', { reviewId: review.id })
    }
    // Now remove the book from the list
    const requestBody = {
      bookListId: Number(bookListId),
      bookId: bookId
    }
    await api.post('/openlibrary/booklists/books/delete', requestBody)
    emit('bookDeleted', bookId)
  } catch (err) {
    console.error('❌ Error deleting book:', err)
    alert('Failed to delete book. Please try again.')
  }
  }

// Create a reactive reference for coverId
const bookCoverId = computed(() => book.coverId)
const coverUrl = useSimpleCoverUrl(bookCoverId, 'M')
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

.hover-actions .delete-btn {
  background: #e74c3c;
  color: white;
  margin-left: 0.3rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: 0;
  min-height: 0;
}
.hover-actions .delete-btn:hover {
  background: #c0392b;
}

.delete-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5px;
  pointer-events: none;
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
