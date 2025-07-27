<template>
  <div class="profile-detail">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-else class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="profileData.avatarUrl || '/src/assets/author.jpg'" :alt="profileData.username" />
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ profileData.username }}</h1>
          <p class="profile-bio">{{ profileData.bio || 'No bio available' }}</p>
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-number">{{ profileData.totalBooks || 0 }}</span>
              <span class="stat-label">Books</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ profileData.totalLists || 0 }}</span>
              <span class="stat-label">Lists</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ profileData.totalLikes || 0 }}</span>
              <span class="stat-label">Likes</span>
            </div>
          </div>
          <!-- Edit Profile Button -->
          <div class="profile-actions">
            <RouterLink to="/profile/edit" class="edit-profile-btn">
              Edit Profile
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Compact Lists Section -->
      <div class="lists-section">
        <div v-if="userLists.length === 0" class="empty-lists">
          <BookOpen class="empty-icon" />
          <p>No default lists found</p>
          <RouterLink to="/lists" class="create-list-btn">
            <Plus class="icon" /> View All Lists
          </RouterLink>
        </div>

        <div v-else class="lists-container">
          <div class="lists-row">
            <div 
              v-for="list in userLists" 
              :key="list.id"
              class="list-item"
              @click="navigateToList(list)"
            >
              <h3 class="list-name">{{ list.name }}</h3>
              <p class="list-desc">{{ list.description }}</p>
              <div class="list-info">
                <span class="book-count">{{ list.booksCount }} books</span>
                <span class="list-date">{{ formatDate(list.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { BookOpen, Heart, MessageCircle, Plus } from 'lucide-vue-next'
import BookCard from '@/components/BookCard.vue'
import api from '@/api/api.js'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, username } = useAuth()

const profileData = ref({
  username: '',
  bio: '',
  avatarUrl: '',
  totalBooks: 0,
  totalLists: 0,
  totalLikes: 0
})

const userLists = ref([])
const loading = ref(false)
const error = ref(null)

// Fetch user profile data
async function fetchProfileData() {
  const profileUsername = route.params.username
  
  if (!profileUsername) {
    error.value = 'No username provided'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('👤 Fetching profile data for:', profileUsername)
    
    // Fetch user's lists to get profile data
    const response = await api.get('/openlibrary/booklists')
    console.log('📥 Lists API Response:', response.data)
    
    // Log default flag for every list
    console.log('🔍 default flags for all lists:')
    response.data.forEach(list => {
      console.log(`  List ID: ${list.id}, default: ${list.default}, username: ${list.username}, userId: ${list.userId}`)
    })
    
    console.log('👤 Current profile username:', profileUsername)
    
    // Filter lists for this specific user and only show default lists
    const userListsData = response.data.filter(list => {
      const isUserMatch = list.username === profileUsername || list.userId === profileUsername
      const isDefault = list.default === true
      console.log(`  List ${list.id}: userMatch=${isUserMatch}, isDefault=${isDefault}, willShow=${isUserMatch && isDefault}`)
      return isUserMatch && isDefault
    })
    
    console.log('📚 User lists found:', userListsData.length)
    
    // For debugging: also show all default lists regardless of user
    const allDefaultLists = response.data.filter(list => list.default === true)
    console.log('🔍 All default lists (regardless of user):', allDefaultLists.length)
    allDefaultLists.forEach(list => {
      console.log(`  Default list: ID ${list.id}, name: "${list.name}", username: ${list.username}`)
    })
    
    // Map the lists data
    userLists.value = userListsData.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description || `A collection of ${list.books?.length || 0} books`,
      booksCount: list.books?.length || list.bookIds?.length || 0,
      books: list.books?.map(book => ({
        id: book.bookId || book.id || book.isbn || 0,
        title: book.title,
        coverId: book.coverId, // Add coverId mapping
        coverUrl: book.coverUrl || book.cover_url || '/src/assets/cover.jpg',
        authors: book.authors?.map(author => author.name).join(', ') || 'Unknown Author'
      })) || [],
      likes: list.likes || 0,
      comments: list.comments || 0,
      createdAt: list.createdAt || new Date().toISOString().split('T')[0]
    }))
    
    // Calculate profile stats
    const totalBooks = userLists.value.reduce((sum, list) => sum + list.booksCount, 0)
    const totalLikes = userLists.value.reduce((sum, list) => sum + list.likes, 0)
    
    profileData.value = {
      username: profileUsername,
      bio: `Book enthusiast with ${userLists.value.length} lists`,
      avatarUrl: '/src/assets/author.jpg',
      totalBooks,
      totalLists: userLists.value.length,
      totalLikes
    }
    
    console.log('👤 Profile data loaded:', profileData.value)
    
  } catch (err) {
    console.error('❌ Error fetching profile data:', err)
    
    if (err.response?.status === 403) {
      error.value = 'Access denied. Please log in to view this profile.'
    } else if (err.response?.status === 404) {
      error.value = 'Profile not found.'
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch profile data'
    }
  } finally {
    loading.value = false
  }
}



// Navigate to list detail
function navigateToList(list) {
  console.log('📚 Navigating to list:', list.name)
  localStorage.setItem('currentListData', JSON.stringify({
    listId: list.id,
    listName: list.name,
    books: list.books
  }))
  router.push(`/lists/${list.id}`)
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

// Load profile data when component mounts
onMounted(() => {
  if (!isLoggedIn.value) {
    error.value = 'Please log in to view profiles.'
    return
  }
  
  fetchProfileData()
})
</script>

<style scoped>
.profile-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: rgb(200, 200, 200);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgb(100, 100, 100);
  border-top: 3px solid #0077cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Header */
.profile-header {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: rgb(20, 20, 30);
  border-radius: 12px;
  border: 1px solid rgb(60, 60, 80);
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0077cc;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.profile-name {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0;
}

.profile-bio {
  font-size: 1rem;
  color: rgb(160, 160, 160);
  margin: 0;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0077cc;
}

.stat-label {
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Lists Section */
.lists-section {
  background: rgb(20, 20, 30);
  border-radius: 12px;
  border: 1px solid rgb(60, 60, 80);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgb(60, 60, 80);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0;
}

.list-count {
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
  background: rgb(40, 40, 50);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.empty-lists {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: rgb(140, 140, 140);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgb(100, 100, 100);
  margin-bottom: 1rem;
}

.create-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-list-btn:hover {
  background: #005fa3;
}

/* Simple Lists Row */
.lists-container {
  padding: 1rem;
}

.lists-row {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
}

.list-item {
  flex: 0 0 200px;
  background: rgb(40, 40, 50);
  border: 1px solid rgb(80, 80, 80);
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
}

.list-item:hover {
  border-color: #0077cc;
}

.list-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 0.5rem 0;
}

.list-desc {
  font-size: 0.875rem;
  color: rgb(160, 160, 160);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.list-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgb(140, 140, 140);
}

.book-count {
  font-weight: 500;
}

.list-date {
  color: rgb(120, 120, 120);
}

/* Profile Actions */
.profile-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.edit-profile-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover {
  background: #005fa3;
}


/* Responsive Design */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .compact-lists-row {
    gap: 1rem;
  }
  
  .compact-list-card {
    flex: 0 0 250px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
