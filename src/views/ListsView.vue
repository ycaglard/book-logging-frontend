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

    <div class="lists-grid">
      <div class="list-card" v-for="list in sortedLists" :key="list.id">
        <div class="list-visual">
          <RouterLink :to="`/lists/${list.id}`"><BookStack :books="list.books" /></RouterLink>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { lists } from '@/data/sampleData.js'
import BookStack from '@/components/BookStack.vue'

const selectedSort = ref('likes-most')

const sortedLists = computed(() => {
  const copy = [...lists]

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
</style>
