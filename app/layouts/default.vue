<template>
  <div class="layout">
    <header class="site-header">
      <nav class="main-nav">
        <div class="logo-container">
          <a href="/" class="logo-link">Almas Køkken</a>
        </div>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">Opskrifter</NuxtLink>
          <NuxtLink to="/madplan" class="nav-link">Madplan</NuxtLink>
        </div>
        <div class="theme-toggle-container">
          <ThemeToggle />
        </div>
      </nav>
    </header>
    
    <main class="main-content">
      <slot />
    </main>
    
    <footer class="site-footer">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} Almas Køkken. Alle rettigheder forbeholdes.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import ThemeToggle from '~/components/ThemeToggle.vue';
</script>

<style>
/* Import theme CSS */
@import url('~/assets/css/themes.css');

/* Base styles */
body {
  margin: 0;
  padding: 0;
  font-family: 'Lora', serif;
  background-color: var(--color-background);
  color: var(--color-text);
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-header {
  background-color: var(--color-primary);
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.main-nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  font-family: 'Playfair Display', serif;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.theme-toggle-container {
  color: white;
}

.main-content {
  flex-grow: 1;
  padding: 30px 0;
}

.site-footer {
  background-color: var(--color-background-secondary);
  padding: 20px 0;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Media queries */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 15px;
  }
  
  .theme-toggle-container {
    position: absolute;
    top: 15px;
    right: 20px;
  }
}
</style>
