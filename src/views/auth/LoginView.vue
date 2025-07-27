<template>
  <div class="auth-form">
    <h1>Login</h1>
    <form @submit.prevent="onSubmit">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p>Don't have an account? <RouterLink to="/register">Register here</RouterLink></p>
    <p class="error" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const { performLogin } = useAuth()

async function onSubmit() {
  loading.value = true
  error.value = null

  console.log('🔐 Login form submitting with:', {
    username: username.value,
    password: password.value ? '[HIDDEN]' : 'Empty',
  })

  const result = await performLogin({
    username: username.value,
    password: password.value,
  })

  console.log('🔐 Login result:', result)

  if (result.success) {
    console.log('✅ Login successful, redirecting to home')
    router.push('/')
  } else {
    console.error('❌ Login failed:', result.error)
    error.value = result.error
  }

  loading.value = false
}
</script>

<style scoped>
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
  background: #0077cc;
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
