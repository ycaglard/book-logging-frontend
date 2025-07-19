<template>
  <div class="lists-view">
    <div class="sort-container">
      <p class="lists-label">Lists</p>
      <div class="sort-controls">
        <label for="sort">sort by</label>
        <select id="sort" v-model="selectedSort">
          <option value="likes-most">Most Likes</option>
          <option value="likes-least">Least Likes</option>
          <option value="books-most">Most Books</option>
          <option value="books-least">Least Books</option>
          <option value="comments-most">Most Comments</option>
          <option value="comments-least">Least Comments</option>
          <option value="recent-most">Most Recent</option>
          <option value="recent-least">Least Recent</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading lists...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchLists" class="retry-btn">Try Again</button>
      <button @click="debugToken" class="debug-btn">Debug Token</button>
      <button @click="clearToken" class="clear-btn">Clear Token & Relogin</button>
    </div>

    <!-- Lists grid -->
    <div v-else class="lists-grid">
      <div class="list-card" v-for="list in sortedLists" :key="list.id">
        <div class="list-visual">
          <RouterLink :to="`/lists/${list.id}`" @click="storeListData(list)"><BookStack :books="list.books" /></RouterLink>
        </div>
        <div class="list-details">
          <div class="list-text">
            <h2 class="list-title">{{ list.name }}</h2>
            <p class="list-description">{{ list.description }}</p>
          </div>
          <div class="list-meta">
            <router-link :to="`/profiles/${list.userId}`" class="list-user">{{
              list.userId
            }}</router-link>
            <span>{{ list.likes }} likes</span>
            <span>{{ list.comments }} comments</span>
            <span>{{ list.booksCount }} books</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add List button -->
    <div class="add-list-container">
      <button class="add-list-btn" @click="handleAddList">
        <Plus class="icon" /> Add List
      </button>
    </div>

    <!-- Add List Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create New List</h2>
          <button class="close-btn" @click="closeModal">
            <X class="icon" />
          </button>
        </div>
        <form class="modal-form" @submit.prevent="createList">
          <div class="form-group">
            <label for="listName">List Name</label>
            <input 
              id="listName" 
              v-model="newList.name" 
              type="text" 
              placeholder="Enter list name"
              required
            />
          </div>
          <div class="form-group">
            <label for="listDescription">Description</label>
            <textarea 
              id="listDescription" 
              v-model="newList.description" 
              placeholder="Enter list description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
            <button type="submit" class="create-btn">Create List</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/api.js'
import BookStack from '@/components/BookStack.vue'
import { useAuth } from '@/composables/useAuth.js'
import { Plus, X } from 'lucide-vue-next'

const selectedSort = ref('books-most')
const lists = ref([])
const loading = ref(false)
const error = ref(null)
const showAddModal = ref(false)
const newList = ref({
  name: '',
  description: ''
})

// Fetch lists from API
async function fetchLists() {
  loading.value = true
  error.value = null
  
  try {
    console.log('📚 Fetching lists from API...')
    const response = await api.get('/openlibrary/booklists')
    console.log('📥 API Response:', response.data)
    
    // Map the API response to match your expected list structure
    lists.value = response.data.map(list => {
      console.log('📚 Mapping list:', list.name)
      console.log('  - bookIds:', list.bookIds)
      console.log('  - books count:', list.books?.length)
      
      return {
        id: list.id,
        name: list.name,
        description: list.description || `A collection of ${list.books?.length || 0} books`,
        userId: list.username || list.userId,
        likes: list.likes || 0,
        comments: list.comments || 0,
        booksCount: list.books?.length || list.bookIds?.length || 0,
        books: list.books?.map(book => {
          let bookId = book.bookId || book.isbn || book.id || 0;
          if (typeof bookId === 'string' && bookId.startsWith('/works/')) {
            bookId = bookId.replace('/works/', '');
          }
          if (typeof bookId === 'string' && bookId.startsWith('/')) {
            bookId = bookId.substring(1);
          }
          return {
            id: bookId,
            title: book.title,
            coverUrl: book.coverUrl || book.cover_url || '/src/assets/cover.jpg',
            authors: book.authors?.map(author => author.name).join(', ') || 'Unknown Author',
            summary: book.summaries?.[0] || book.summary || '',
            subjects: book.subjects || [],
            languages: book.languages || ['en'],
            downloadCount: book.download_count || 0
          }
        }) || [],
        createdAt: list.createdAt || new Date().toISOString().split('T')[0]
      }
    })
    
    console.log('📚 Mapped lists:', lists.value)
  } catch (err) {
    console.error('❌ Error fetching lists:', err)
    
    if (err.response?.status === 403) {
      error.value = 'Access denied. Please log in to view lists.'
      console.log('🔒 403 Forbidden - Authentication required')
    } else if (err.response?.status === 401) {
      error.value = 'Authentication failed. Please log in again.'
      console.log('🔑 401 Unauthorized - Invalid token')
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch lists'
    }
  } finally {
    loading.value = false
  }
}

// Test function to debug token and API
function debugToken() {
  console.log('🔍 Full localStorage Debug:')
  console.log('  - All localStorage keys:', Object.keys(localStorage))
  
  const token = localStorage.getItem('token')
  console.log('🔍 Token Debug:')
  console.log('  - Token exists:', !!token)
  console.log('  - Token length:', token?.length || 0)
  console.log('  - Token value:', token) // Show the actual token
  console.log('  - Token type:', typeof token)
  console.log('  - Token === undefined:', token === undefined)
  console.log('  - Token === null:', token === null)
  console.log('  - Token === "undefined":', token === 'undefined')
  
  if (token && token !== 'undefined') {
    console.log('  - Token starts with:', token.substring(0, 10) || 'N/A')
    console.log('  - Token ends with:', token.substring(token.length - 10) || 'N/A')
    
    // Test if token is valid JWT format
    const parts = token.split('.')
    console.log('  - JWT parts:', parts.length)
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]))
        console.log('  - JWT payload:', payload)
        console.log('  - Token expires:', payload.exp ? new Date(payload.exp * 1000) : 'No expiration')
        console.log('  - Token is expired:', payload.exp ? Date.now() > payload.exp * 1000 : 'Unknown')
      } catch (e) {
        console.log('  - Invalid JWT payload:', e.message)
      }
    } else {
      console.log('  - Not a JWT token - this might be a session ID or user ID')
    }
  } else {
    console.log('  - Token is null, undefined, or the string "undefined"')
  }
}

// Store list data in localStorage for BookDetailView
function storeListData(list) {
  console.log('💾 Storing list data in localStorage:', list.name)
  localStorage.setItem('currentListData', JSON.stringify({
    listId: list.id,
    listName: list.name,
    books: list.books
  }))
  console.log('✅ List data stored successfully')
}

// Clear token and redirect to login
function clearToken() {
  console.log('🧹 Clearing localStorage...')
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  console.log('✅ localStorage cleared')
  console.log('🔄 Redirecting to login...')
  window.location.href = '/login'
}

// Handle Add List button click
function handleAddList() {
  showAddModal.value = true
}

// Close Add List Modal
function closeModal() {
  showAddModal.value = false
  newList.value = {
    name: '',
    description: ''
  }
}

// Create new list
async function createList() {
  if (!newList.value.name) {
    alert('List name cannot be empty!')
    return
  }

  try {
    const response = await api.post('/openlibrary/booklists', newList.value)
    console.log('📥 New list created:', response.data)
    alert('List created successfully!')
    closeModal()
    fetchLists() // Refresh the list to include the new one
  } catch (err) {
    console.error('❌ Error creating list:', err)
    alert('Failed to create list. Please try again.')
  }
}

// Load lists when component mounts
onMounted(() => {
  // Check if user is logged in using the auth composable
  const { isLoggedIn, token } = useAuth()
  
  console.log('🔍 Authentication check:')
  console.log('  - Is logged in:', isLoggedIn.value)
  console.log('  - Token exists:', !!token.value)
  
  if (!isLoggedIn.value) {
    error.value = 'Please log in to view lists.'
    console.log('⚠️ User not authenticated')
    return
  }
  
  // Debug the token
  debugToken()
  
  fetchLists()
})

const sortedLists = computed(() => {
  const copy = [...lists.value]

  switch (selectedSort.value) {
    case 'likes-most':
      return copy.sort((a, b) => b.likes - a.likes)
    case 'likes-least':
      return copy.sort((a, b) => a.likes - b.likes)
    case 'books-most':
      return copy.sort((a, b) => b.books.length - a.books.length)
    case 'books-least':
      return copy.sort((a, b) => a.books.length - b.books.length)
    case 'comments-most':
      return copy.sort((a, b) => b.comments - a.comments)
    case 'comments-least':
      return copy.sort((a, b) => a.comments - b.comments)
    case 'recent-most':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'recent-least':
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    default:
      return copy
  }
})
</script>

<style scoped>
.lists-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  color: rgb(200, 200, 200);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.lists-label {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: rgb(200, 200, 200);
}

.sort-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgb(100, 100, 100);
  margin-bottom: 1.5rem;
  height: 40px;
}

.sort-controls {
  display: flex;
  gap: 0.2rem;
  align-items: center;
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
  font-family: inherit;
  font-size: inherit;
  color: rgb(200, 200, 200);
  background-color: var(--color-background);
  padding: 0 0.3rem;
}

.sort-controls select option:hover {
  color: white !important;
  background-color: transparent !important;
}

.add-list-btn {
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

.add-list-btn:hover {
  background: #005fa3;
}

.add-list-btn .icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

.add-list-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
}

.lists-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-card {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 6px;
  gap: 2rem;
}

.list-visual {
  width: fit-content;
  height: fit-content;
  border-radius: 4px;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.list-visual:hover {
  border-color: white;
  border-radius: 4px 4px 4px 4px;
  cursor: pointer;
}

.list-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.list-text {
  text-align: left;
}

.list-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(200, 200, 200);
}

.list-description {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: rgb(170, 170, 170);
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: rgb(150, 150, 150);
  margin-top: 0.5rem;
}

.list-user {
  color: rgb(150, 150, 150);
  text-decoration: none;
  font-weight: 500;
}

.list-user:hover {
  text-decoration: underline;
  color: rgb(200, 200, 200);
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

.debug-btn {
  margin-top: 1rem;
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.debug-btn:hover {
  background: #5a6268;
}

.clear-btn {
  margin-top: 1rem;
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #c82333;
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
.create-btn {
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

.create-btn {
  background: #0077cc;
  color: white;
}

.create-btn:hover {
  background: #005fa3;
}
</style>
