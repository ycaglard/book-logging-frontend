<template>
  <header class="app-header">
    <nav class="nav-container">
      <div class="nav-left">
        <RouterLink to="/" class="logo" aria-label="Home"><Book /></RouterLink>
        <RouterLink to="/" class="app-name">BookLog</RouterLink>
      </div>
      <ul class="nav-links">
        <li>
          <RouterLink :to="`/profiles/${username}`">{{ username }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/books">Books</RouterLink>
        </li>
        <li>
          <RouterLink to="/lists">Lists</RouterLink>
        </li>
        <li>
          <RouterLink to="/search"><Search class="icon" /></RouterLink>
        </li>
        <li>
          <RouterLink to="/log-book" class="log-book-link">
            <Plus class="plus-icon" /> Log a Book
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { Search, Plus, Book } from 'lucide-vue-next'
const username = 'exampleUsername'
</script>

<style scoped>
.app-header {
  padding: 1rem 2rem;
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

.log-book-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  background-color: #28a745;
  color: white !important;
  border-radius: 3px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.log-book-link:hover {
  background-color: #218838 !important;
  color: white !important;
}

.plus-icon {
  width: 16px;
  height: 16px;
  stroke-width: 3;
  stroke: white;
}

.icon {
  width: 18px;
  height: 18px;
}
</style>
