<template>
  <div class="edit-profile">
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      <form class="edit-profile-form" @submit.prevent="handleSubmit">
        <!-- Avatar Section -->
        <div class="form-section">
          <h3>Profile Picture</h3>
          <div class="avatar-section">
            <div class="current-avatar">
              <img :src="formData.avatarUrl || '/src/assets/author.jpg'" :alt="formData.username" />
            </div>
            <div class="avatar-actions">
              <button type="button" class="upload-btn">Upload New Photo</button>
              <button type="button" class="remove-btn">Remove Photo</button>
            </div>
          </div>
        </div>

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
            <label for="displayName">Display Name</label>
            <input 
              type="text" 
              id="displayName" 
              v-model="formData.displayName" 
              placeholder="Enter your display name"
            />
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

        <!-- Form Actions -->
        <div class="form-actions">
          <RouterLink :to="`/profiles/${formData.username}`" class="cancel-btn">Cancel</RouterLink>
          <button type="submit" class="save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const { username } = useAuth()

const formData = ref({
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  email: '',
  website: '',
  twitter: '',
  instagram: '',
  goodreads: ''
})

// Load current profile data
async function loadProfileData() {
  // TODO: Implement API call to fetch current profile data
  formData.value = {
    username: username.value || 'user',
    displayName: '',
    bio: '',
    avatarUrl: '/src/assets/author.jpg',
    email: '',
    website: '',
    twitter: '',
    instagram: '',
    goodreads: ''
  }
}

// Handle form submission
async function handleSubmit() {
  // TODO: Implement API call to update profile
  console.log('Saving profile data:', formData.value)
  
  // For now, just redirect back to profile
  router.push(`/profiles/${formData.value.username}`)
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

/* Avatar Section */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.current-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0077cc;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-btn,
.remove-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgb(80, 80, 80);
  border-radius: 6px;
  background: rgb(40, 40, 50);
  color: rgb(200, 200, 200);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #0077cc;
  border-color: #0077cc;
  color: white;
}

.remove-btn:hover {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
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
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
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