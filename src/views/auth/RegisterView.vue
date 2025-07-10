<template>
  <div class="auth-form">
    <h1>Register</h1>
    <form @submit.prevent="onSubmit">
      <input v-model="username" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing up...' : 'Register' }}
      </button>
    </form>
    <p>Already have an account? <RouterLink to="/login">Login here</RouterLink></p>
    <p class="error" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api from '@/api/api.js'

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const router = useRouter()

async function onSubmit() {
  loading.value = true
  error.value = null
  try {
    const res = await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
    })
    if (res) {
      console.log('res received')
    }
    localStorage.setItem('username', username.value)
    router.push('/verify')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* same styles as LoginView */
.auth-form {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: #1a1a1a;
  border-radius: 6px;
}
input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  background: #222;
  border: none;
  border-radius: 4px;
  color: #eee;
}
button {
  width: 100%;
  padding: 0.7rem;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error {
  color: #e74c3c;
  margin-top: 1rem;
}
</style>
