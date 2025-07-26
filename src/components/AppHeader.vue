<template>
  <header class="app-header">
    <nav class="nav-container">
      <div class="nav-left">
        <RouterLink to="/" class="logo" aria-label="Home"><Book /></RouterLink>
        <RouterLink to="/" class="app-name">BookLog</RouterLink>
      </div>
      <ul class="nav-links">
        <!-- Show user-specific links when logged in -->
        <template v-if="isLoggedIn">
        <li>
          <RouterLink :to="`/profiles/${username}`">{{ username }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/lists">Lists</RouterLink>
        </li>
        <li class="search-container">
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search books..."
              class="search-input"
              @keyup.enter="handleSearch"
              @input="handleSearchInput"
            />
            <button @click="handleSearch" class="search-btn" :disabled="!searchQuery.trim()">
              <Search class="icon" />
            </button>
          </div>
        </li>
          <li>
            <button @click="handleLogout" class="logout-btn">
              <LogOut class="logout-icon" /> Logout
            </button>
          </li>
        </template>
        
        <!-- Show login button when not logged in -->
        <template v-else>
          <li>
            <RouterLink to="/login" class="login-btn">
              <LogIn class="login-icon" /> Login
            </RouterLink>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Book, LogOut, LogIn } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const { isLoggedIn, username, logout } = useAuth()

// Search functionality
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
    searchQuery.value = '' // Clear the search box after search
  }
}

const handleSearchInput = () => {
  // Optional: Add debounced search or other real-time functionality here
}

const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
.app-header {
  padding: 1rem;
  display: flex;
  justify-content: center;
  background-color: rgb(10, 10, 18);
}

.nav-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(200, 200, 200);
}

.logo {
  font-size: 1.5rem;
  text-decoration: none;
  color: #0077cc;
}

.app-name {
  font-weight: bold;
  font-size: 1.2rem;
  text-decoration: none;
  color: rgb(200, 200, 200);
}

.nav-links {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  flex-wrap: nowrap;
}

.nav-links li {
  display: inline-flex;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  color: rgb(150, 150, 150);
}

.nav-links a:hover {
  color: white;
  background-color: transparent;
}



.icon {
  width: 18px;
  height: 18px;
}

/* Search Bar Styles */
.search-container {
  display: flex;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgb(30, 30, 35);
  border-radius: 6px;
  border: 1px solid rgb(60, 60, 60);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.search-bar:focus-within {
  border-color: #0077cc;
}

.search-input {
  background: transparent;
  border: none;
  color: rgb(200, 200, 200);
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  outline: none;
  width: 200px;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgb(120, 120, 120);
}

.search-btn {
  background: transparent;
  border: none;
  color: rgb(150, 150, 150);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  color: white;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-input {
    width: 150px;
  }
}

@media (max-width: 600px) {
  .search-input {
    width: 120px;
    font-size: 0.8rem;
  }
  
  .search-input::placeholder {
    font-size: 0.8rem;
  }
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  background-color: #0077cc;
  color: white !important;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #005fa3 !important;
  color: white !important;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}

.login-icon,
.logout-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}
</style>
