import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import BookDetailView from '../views/BookDetailView.vue'
import AuthorDetailView from '../views/AuthorDetailView.vue'

import ProfileDetailView from '../views/profile/ProfileDetailView.vue'

import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'

import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/book/:id', name: 'book-detail', component: BookDetailView },
    { path: '/author/:id', name: 'author', component: AuthorDetailView },
    { path: '/profile/:username', name: 'profile-detail', component: ProfileDetailView },

    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

export default router
