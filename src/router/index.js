import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import BooksView from '../views/BooksView.vue'
import ListsView from '../views/ListsView.vue'
import BookLoggingView from '../views/BookLoggingView.vue'
import OpenLibraryView from '../views/OpenLibraryView.vue'

import BookDetailView from '../views/BookDetailView.vue'
import AuthorDetailView from '../views/AuthorDetailView.vue'
import ListDetailView from '../views/ListDetailView.vue'

import ProfileDetailView from '../views/profile/ProfileDetailView.vue'
import EditProfileView from '../views/profile/EditProfileView.vue'

import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import VerificationView from '../views/auth/VerificationView.vue'

import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/books', name: 'books', component: BooksView },
    { path: '/lists', name: 'user-lists', component: ListsView },
    { path: '/log-book', name: 'log-book', component: BookLoggingView },
    { path: '/open-library/books', name: 'open-library', component: OpenLibraryView },

    { path: '/books/:id', name: 'book-detail', component: BookDetailView },
    { path: '/authors/:id', name: 'author', component: AuthorDetailView },
    { path: '/profiles/:username', name: 'profile-detail', component: ProfileDetailView },
    { path: '/profile/edit', name: 'edit-profile', component: EditProfileView },
    { path: '/lists/:id', name: 'list-detail', component: ListDetailView },

    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/verify', name: 'verify', component: VerificationView },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/verify']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  if (authRequired && !token) {
    return next('/login')
  }

  next()
})

export default router
