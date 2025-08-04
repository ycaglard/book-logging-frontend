<template>
  <div class="edit-profile">
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadProfileData" class="retry-btn">Retry</button>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        <p>{{ success }}</p>
      </div>

      <form v-if="!loading" class="edit-profile-form" @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              v-model="formData.username" 
              placeholder="Enter your username"
              disabled
            />
            <small>Username cannot be changed</small>
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio" 
              v-model="formData.bio" 
              placeholder="Tell us about yourself..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <h3>Contact Information</h3>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              placeholder="Enter your email"
              disabled
            />
            <small>Email cannot be changed from this form</small>
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              v-model="formData.phoneNumber" 
              placeholder="+1234567890"
            />
          </div>

          <div class="form-group">
            <label for="dateOfBirth">Date of Birth</label>
            <input 
              type="date" 
              id="dateOfBirth" 
              v-model="formData.dateOfBirth" 
            />
          </div>

          <div class="form-group">
            <label for="website">Website</label>
            <input 
              type="url" 
              id="website" 
              v-model="formData.website" 
              placeholder="https://your-website.com"
            />
          </div>

          <button 
            type="button" 
            @click="updateContactInfo" 
            class="update-contact-btn"
            :disabled="!formData.phoneNumber || loading"
          >
            {{ loading ? 'Updating Contact...' : 'Update Contact Info' }}
          </button>
        </div>

        <!-- Social Links -->
        <div class="form-section">
          <h3>Social Links</h3>
          <div class="form-group">
            <label for="twitter">Twitter</label>
            <input 
              type="url" 
              id="twitter" 
              v-model="formData.twitter" 
              placeholder="https://twitter.com/yourusername"
            />
          </div>

          <div class="form-group">
            <label for="instagram">Instagram</label>
            <input 
              type="url" 
              id="instagram" 
              v-model="formData.instagram" 
              placeholder="https://instagram.com/yourusername"
            />
          </div>

          <div class="form-group">
            <label for="goodreads">Goodreads</label>
            <input 
              type="url" 
              id="goodreads" 
              v-model="formData.goodreads" 
              placeholder="https://goodreads.com/user/show/yourusername"
            />
          </div>
        </div>

        <!-- Password Change -->
        <div class="form-section">
          <h3>Change Password</h3>
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="passwordData.currentPassword" 
              placeholder="Enter your current password"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="passwordData.newPassword" 
              placeholder="Enter your new password"
            />
            <small>Password must be at least 6 characters long</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="passwordData.confirmPassword" 
              placeholder="Confirm your new password"
            />
          </div>

          <button 
            type="button" 
            @click="changePassword" 
            class="change-password-btn"
            :disabled="!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading"
          >
            {{ loading ? 'Changing Password...' : 'Change Password' }}
          </button>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <RouterLink :to="`/profiles/${formData.username}`" class="cancel-btn">Cancel</RouterLink>
          <button type="submit" class="save-btn" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import api from '@/api/api.js'

const router = useRouter()
const { username } = useAuth()

const formData = ref({
  username: '',
  bio: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  website: '',
  twitter: '',
  instagram: '',
  goodreads: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

// Load current profile data
async function loadProfileData() {
  loading.value = true
  error.value = null
  
  try {
    console.log('👤 Loading current user profile...')
    const response = await api.get('/profile/me')
    
    console.log('📥 Full API response:', response)
    console.log('📥 Response status:', response.status)
    console.log('📥 Response data:', response.data)
    
    if (response.data.success) {
      const profile = response.data.data
      
      console.log('🔍 Raw profile data:', profile)
      
      formData.value = {
        username: profile.username || username.value || 'user',
        bio: profile.bio || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        goodreads: profile.goodreads || ''
      }
      console.log('✅ Profile data loaded:', formData.value)
    } else {
      throw new Error(response.data.message || 'Failed to load profile')
    }
  } catch (err) {
    console.error('❌ Error loading profile:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load profile data'
    
    // Set default values if API fails
    formData.value = {
      username: username.value || 'user',
      bio: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      website: '',
      twitter: '',
      instagram: '',
      goodreads: ''
    }
  } finally {
    loading.value = false
  }
}

// Handle form submission
async function handleSubmit() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    console.log('💾 Saving profile data...')
    
    // Validate required fields
    if (!formData.value.bio && !formData.value.phoneNumber && !formData.value.dateOfBirth) {
      error.value = 'Please fill in at least one field to update your profile.'
      loading.value = false
      return
    }
    
    // Prepare the update data
    const updateData = {}
    
    if (formData.value.bio) {
      updateData.bio = formData.value.bio
    }
    
    if (formData.value.phoneNumber) {
      updateData.phoneNumber = formData.value.phoneNumber
    }
    
    if (formData.value.dateOfBirth) {
      updateData.dateOfBirth = formData.value.dateOfBirth
    }

    const response = await api.put('/profile/update', updateData)

    if (response.data.success) {
      success.value = 'Profile updated successfully!'
      console.log('✅ Profile updated:', response.data.data)
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push(`/profiles/${formData.value.username}`)
      }, 1500)
    } else {
      throw new Error(response.data.message || 'Update failed')
    }
  } catch (err) {
    console.error('❌ Error updating profile:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

// Handle contact information update
async function updateContactInfo() {
  if (!formData.value.phoneNumber) {
    error.value = 'Phone number cannot be empty.'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    console.log('💬 Updating contact information...')
    const response = await api.put('/profile/contact', {
      phoneNumber: formData.value.phoneNumber,
      dateOfBirth: formData.value.dateOfBirth,
      website: formData.value.website
    })

    if (response.data.success) {
      success.value = 'Contact information updated successfully!'
      console.log('✅ Contact information updated:', response.data.data)
    } else {
      throw new Error(response.data.message || 'Contact update failed')
    }
  } catch (err) {
    console.error('❌ Error updating contact information:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to update contact information'
  } finally {
    loading.value = false
  }
}

// Handle password change
async function changePassword() {
  if (!passwordData.value.currentPassword || !passwordData.value.newPassword || !passwordData.value.confirmPassword) {
    error.value = 'Please fill in all password fields.'
    return
  }

  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    error.value = 'New password and confirm password do not match.'
    return
  }

  if (passwordData.value.newPassword.length < 6) {
    error.value = 'New password must be at least 6 characters long.'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    console.log('🔑 Changing password...')
    const response = await api.post('/profile/change-password', {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })

    if (response.data.success) {
      success.value = 'Password changed successfully!'
      console.log('✅ Password changed:', response.data.data)
      // Clear password fields after successful change
      passwordData.value.currentPassword = ''
      passwordData.value.newPassword = ''
      passwordData.value.confirmPassword = ''
    } else {
      throw new Error(response.data.message || 'Password change failed')
    }
  } catch (err) {
    console.error('❌ Error changing password:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to change password'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.edit-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: rgb(200, 200, 200);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.edit-profile-container {
  background: rgb(20, 20, 30);
  border-radius: 12px;
  border: 1px solid rgb(60, 60, 80);
  overflow: hidden;
}

.edit-profile-header {
  padding: 2rem;
  border-bottom: 1px solid rgb(60, 60, 80);
  text-align: center;
}

.edit-profile-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 0.5rem 0;
}

.edit-profile-header p {
  color: rgb(160, 160, 160);
  margin: 0;
}

.edit-profile-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgb(60, 60, 80);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: rgb(200, 200, 200);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgb(40, 40, 50);
  border: 1px solid rgb(80, 80, 80);
  border-radius: 6px;
  color: rgb(220, 220, 220);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0077cc;
}

.form-group input:disabled {
  background: rgb(30, 30, 40);
  color: rgb(140, 140, 140);
  cursor: not-allowed;
}

.form-group small {
  display: block;
  font-size: 0.875rem;
  color: rgb(140, 140, 140);
  margin-top: 0.25rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgb(60, 60, 80);
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgb(80, 80, 80);
  border-radius: 8px;
  background: transparent;
  color: rgb(200, 200, 200);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgb(40, 40, 50);
  border-color: rgb(100, 100, 100);
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: #0077cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background: #005fa3;
}

.change-password-btn {
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.change-password-btn:hover:not(:disabled) {
  background: #c0392b;
}

.change-password-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.update-contact-btn {
  padding: 0.75rem 1.5rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.update-contact-btn:hover:not(:disabled) {
  background: #27ae60;
}

.update-contact-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: rgb(160, 160, 160);
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #0077cc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  padding: 1rem;
  background: #e74c3c;
  color: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2980b9;
}

/* Success Message */
.success-message {
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .edit-profile {
    padding: 1rem;
  }
  
  .edit-profile-header {
    padding: 1.5rem;
  }
  
  .edit-profile-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
