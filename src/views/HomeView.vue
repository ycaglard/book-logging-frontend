<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to BookLog</h1>
        <p class="hero-subtitle">Your personal space for discovering, organizing, and sharing your favorite books</p>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">What You Can Do</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <BookOpen class="icon" />
            </div>
            <h3 class="feature-title">Discover Books</h3>
            <p class="feature-description">
              Explore a vast collection of books from OpenLibrary. Search by title, author, or genre to find your next great read.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <List class="icon" />
            </div>
            <h3 class="feature-title">Create Lists</h3>
            <p class="feature-description">
              Organize your reading with custom book lists. Create themed collections, reading challenges, or wishlists.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <MessageSquare class="icon" />
            </div>
            <h3 class="feature-title">Share Reviews</h3>
            <p class="feature-description">
              Rate and review books you've read. Share your thoughts with the community and discover recommendations.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <Users class="icon" />
            </div>
            <h3 class="feature-title">Connect</h3>
            <p class="feature-description">
              Follow other readers, explore their lists, and discover new books through the community.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="container">
        <h2 class="section-title">Get Started</h2>
        <div class="actions-grid">
          <RouterLink to="/books" class="action-card">
            <Search class="icon" />
            <h3>Browse Books</h3>
            <p>Start exploring our book collection</p>
          </RouterLink>
          
          <RouterLink to="/lists" class="action-card">
            <List class="icon" />
            <h3>View Lists</h3>
            <p>See what others are reading</p>
          </RouterLink>
          
          <RouterLink to="/search" class="action-card">
            <Search class="icon" />
            <h3>Search</h3>
            <p>Find specific books or authors</p>
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">Books Available</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">User Lists</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">200+</div>
            <div class="stat-label">Reviews</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, List, MessageSquare, Users, Search } from 'lucide-vue-next'
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, rgb(20, 20, 30) 0%, rgb(30, 30, 40) 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  padding: 4rem 0;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 119, 204, 0.1) 0%, rgba(0, 95, 163, 0.1) 100%);
  border-bottom: 1px solid rgb(60, 60, 80);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #0077cc 0%, #005fa3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgb(180, 180, 180);
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  text-align: center;
  margin: 0 0 3rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: rgb(30, 30, 40);
  border: 1px solid rgb(60, 60, 80);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #0077cc;
  box-shadow: 0 8px 32px rgba(0, 119, 204, 0.2);
}

.feature-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(0, 119, 204, 0.2) 0%, rgba(0, 95, 163, 0.2) 100%);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
}

.feature-icon .icon {
  width: 32px;
  height: 32px;
  color: #0077cc;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 1rem 0;
}

.feature-description {
  font-size: 0.95rem;
  color: rgb(160, 160, 160);
  line-height: 1.6;
  margin: 0;
}

/* Quick Actions */
.quick-actions {
  padding: 4rem 0;
  background: rgb(25, 25, 35);
  border-top: 1px solid rgb(60, 60, 80);
  border-bottom: 1px solid rgb(60, 60, 80);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background: rgb(30, 30, 40);
  border: 1px solid rgb(60, 60, 80);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: #0077cc;
  background: rgb(35, 35, 45);
  text-decoration: none;
  color: inherit;
}

.action-card .icon {
  width: 48px;
  height: 48px;
  color: #0077cc;
  margin-bottom: 1rem;
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(220, 220, 220);
  margin: 0 0 0.5rem 0;
}

.action-card p {
  font-size: 0.9rem;
  color: rgb(160, 160, 160);
  margin: 0;
}

/* Stats Section */
.stats-section {
  padding: 3rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-item {
  padding: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0077cc;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: rgb(160, 160, 160);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .features-section,
  .quick-actions {
    padding: 2rem 0;
  }
  
  .feature-card,
  .action-card {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>
