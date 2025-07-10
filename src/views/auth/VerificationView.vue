<template>
  <div class="verify-form">
    <h1>Verify Your Email</h1>

    <p v-if="timeLeft > 0">
      You have <strong>{{ minutes }}:{{ seconds }}</strong> to enter your verification code.
    </p>

    <form @submit.prevent="verify">
      <input
        v-model="code"
        placeholder="Enter 6-digit code"
        maxlength="6"
        required
        pattern="\d{6}"
        :disabled="expired"
      />
      <button type="submit" :disabled="loading || expired">
        {{ loading ? 'Verifying...' : 'Verify' }}
      </button>
    </form>

    <p class="error" v-if="error">{{ error }}</p>
    <p v-if="expired" class="expired-msg">Time expired. Please request a new verification link.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api/api.js'

const router = useRouter()
const route = useRoute()

const code = ref('')
const loading = ref(false)
const error = ref(null)
const expired = ref(false)

const username = localStorage.getItem('username') || route.query.username || ''

// Countdown logic
const timeLeft = ref(120) // 2 minutes

const minutes = computed(() => String(Math.floor(timeLeft.value / 60)).padStart(2, '0'))
const seconds = computed(() => String(timeLeft.value % 60).padStart(2, '0'))

onMounted(() => {
  const interval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      expired.value = true
      clearInterval(interval)
    }
  }, 1000)
})

async function verify() {
  loading.value = true
  error.value = null

  try {
    await api.post('/auth/verify', {
      username,
      verificationCode: code.value,
    })
    localStorage.removeItem('username')
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Verification failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verify-form {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: #1a1a1a;
  border-radius: 6px;
  text-align: center;
}
input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  background: #222;
  border: none;
  border-radius: 4px;
  color: #eee;
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 4px;
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
.expired-msg {
  margin-top: 1rem;
  color: orange;
}
</style>
