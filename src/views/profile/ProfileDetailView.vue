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
        <div class="profile-info">
          <div class="profile-title">
            <div class="profile-name-section">
              <h1 class="profile-name">{{ profileData.username }}</h1>
              <!-- Contact Information -->
              <div class="contact-info" v-if="hasContactInfo">
                <div class="contact-item" v-if="profileData.website">
                  <Globe class="contact-icon" />
                  <a :href="profileData.website" target="_blank" rel="noopener noreferrer" class="contact-link">
                    {{ formatWebsiteUrl(profileData.website) }}
                  </a>
                </div>
                <div class="contact-item" v-if="profileData.email">
                  <Mail class="contact-icon" />
                  <span class="contact-text">{{ profileData.email }}</span>
                </div>
                <div class="contact-item" v-if="profileData.phoneNumber">
                  <Phone class="contact-icon" />
                  <span class="contact-text">{{ profileData.phoneNumber }}</span>
                </div>
                <div class="contact-item" v-if="profileData.dateOfBirth">
                  <Calendar class="contact-icon" />
                  <span class="contact-text">{{ formatDate(profileData.dateOfBirth) }}</span>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <RouterLink to="/profile/edit" class="edit-profile-btn">
                Edit Profile
              </RouterLink>
            </div>
          </div>
          
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
        </div>
      </div>

      <!-- User Lists Section -->
      <div class="lists-section">
        <div class="section-header">
          <h2>My Reading Lists</h2>
          <span class="list-count">{{ userLists.length }} lists</span>
        </div>

        <div v-if="userLists.length === 0" class="empty-lists">
          <BookOpen class="empty-icon" />
          <h3>No Reading Lists Yet</h3>
          <p>Create your first reading list to organize your favorite books</p>
          <RouterLink to="/lists" class="create-list-btn">
            <Plus class="icon" /> View All Lists
          </RouterLink>
        </div>

        <div v-else class="lists-container">
          <div class="lists-grid">
            <div 
              v-for="list in userLists" 
              :key="list.id"
              class="list-card"
              @click="navigateToList(list)"
            >
              <div class="list-header">
                <h3 class="list-name">{{ list.name }}</h3>
                <span class="book-count">{{ list.booksCount }} books</span>
              </div>
              <p class="list-description">{{ list.description }}</p>
              <div class="list-footer">
                <div class="list-stats">
                  <span class="stat-item">
                    <Heart class="stat-icon" />
                    {{ list.likes }}
                  </span>
                  <span class="stat-item">
                    <MessageCircle class="stat-icon" />
                    {{ list.comments }}
                  </span>
                </div>
                <span class="list-date">{{ formatListDate(list.createdAt) }}</span>
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
import { BookOpen, Heart, MessageCircle, Plus, Globe, Mail, Phone, Calendar } from 'lucide-vue-next'
import BookCard from '@/components/BookCard.vue'
import api from '@/api/api.js'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, username } = useAuth()

const profileData = ref({
  username: '',
  bio: '',
  totalBooks: 0,
  totalLists: 0,
  totalLikes: 0,
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  website: ''
})

const userLists = ref([])
const loading = ref(false)
const error = ref(null)

// Computed property to check if user has any contact info
const hasContactInfo = computed(() => {
  return profileData.value.website || 
         profileData.value.email || 
         profileData.value.phoneNumber || 
         profileData.value.dateOfBirth
})

// Format website URL for display
function formatWebsiteUrl(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

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
    
    // First, try to get the user's profile data
    let userProfile = null
    try {
      const profileResponse = await api.get(`/profile/${profileUsername}`)
      if (profileResponse.data.success) {
        userProfile = profileResponse.data.data
        console.log('✅ Profile data loaded:', userProfile)
      }
    } catch (profileErr) {
      console.log('⚠️ Could not fetch profile data, falling back to list data')
    }
    
    // Fetch user's lists to get additional data
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
    
    // Use profile data if available, otherwise fall back to calculated data
    if (userProfile) {
      profileData.value = {
        username: userProfile.username,
        bio: userProfile.bio || `Book enthusiast with ${userLists.value.length} lists`,
        totalBooks: userProfile.readBooks?.length || totalBooks,
        totalLists: userProfile.bookListCount || userLists.value.length,
        totalLikes: totalLikes,
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        website: userProfile.website || ''
      }
    } else {
      profileData.value = {
        username: profileUsername,
        bio: `Book enthusiast with ${userLists.value.length} lists`,
        totalBooks,
        totalLists: userLists.value.length,
        totalLikes,
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        website: ''
      }
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

// Format date for list display
function formatListDate(dateString) {
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

/* Loading States */
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
  padding: 3rem 2rem;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Header */
.profile-header {
  background: rgb(20, 20, 30);
  border-radius: 16px;
  border: 1px solid rgb(60, 60, 80);
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.profile-name-section {
  flex: 1;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(240, 240, 240);
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

/* Contact Information */
.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 119, 204, 0.3);
}

.contact-icon {
  width: 14px;
  height: 14px;
  color: rgb(140, 140, 140);
  flex-shrink: 0;
}

.contact-link {
  color: #0077cc;
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #005fa3;
  text-decoration: underline;
}

.contact-text {
  color: rgb(160, 160, 160);
}

.profile-bio {
  font-size: 1.125rem;
  color: rgb(180, 180, 180);
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
}

.profile-stats {
  display: flex;
  gap: 3rem;
  margin-top: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 80px;
  transition: all 0.2s ease;
}

.stat:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 119, 204, 0.3);
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0077cc;
}

.stat-label {
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
  text-transform: uppercase;
  letter-spacing: 0.75px;
  font-weight: 500;
}

/* Profile Actions */
.profile-actions {
  display: flex;
  gap: 1rem;
}

.edit-profile-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: #0077cc;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 119, 204, 0.2);
}

.edit-profile-btn:hover {
  background: #005fa3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 119, 204, 0.3);
}

/* Lists Section */
.lists-section {
  background: rgb(20, 20, 30);
  border-radius: 16px;
  border: 1px solid rgb(60, 60, 80);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  border-bottom: 1px solid rgb(60, 60, 80);
  background: rgba(255, 255, 255, 0.02);
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
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgb(80, 80, 80);
}

/* Empty Lists */
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
  width: 72px;
  height: 72px;
  color: rgb(100, 100, 100);
  margin-bottom: 1.5rem;
}

.empty-lists h3 {
  color: rgb(180, 180, 180);
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}

.empty-lists p {
  margin: 0 0 2rem 0;
  max-width: 400px;
}

.create-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #0077cc;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-list-btn:hover {
  background: #005fa3;
  transform: translateY(-1px);
}

.create-list-btn .icon {
  width: 20px;
  height: 20px;
}

/* Lists Grid */
.lists-container {
  padding: 2rem 2.5rem;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.list-card {
  background: rgb(30, 30, 40);
  border: 1px solid rgb(80, 80, 80);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-card:hover {
  border-color: #0077cc;
  background: rgb(35, 35, 45);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 119, 204, 0.15);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.list-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.book-count {
  font-size: 0.875rem;
  color: #0077cc;
  background: rgba(0, 119, 204, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 119, 204, 0.2);
  white-space: nowrap;
}

.list-description {
  font-size: 0.9rem;
  color: rgb(160, 160, 160);
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.list-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.list-date {
  font-size: 0.75rem;
  color: rgb(120, 120, 120);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-detail {
    padding: 1rem;
  }
  
  .profile-header {
    padding: 1.5rem;
  }
  
  .profile-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .profile-name {
    font-size: 2rem;
  }
  
  .contact-info {
    margin-top: 0.5rem;
  }
  
  .contact-item {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }
  
  .contact-icon {
    width: 12px;
    height: 12px;
  }
  
  .profile-stats {
    gap: 1.5rem;
    justify-content: center;
  }
  
  .lists-container {
    padding: 1.5rem;
  }
  
  .lists-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-header {
    padding: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .book-count {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .profile-stats {
    gap: 1rem;
  }
  
  .stat {
    min-width: 60px;
    padding: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .contact-item {
    align-self: flex-start;
  }
}
</style>
