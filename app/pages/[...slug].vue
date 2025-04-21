<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Debug info
console.log('Route path:', route.path)
console.log('Route params:', route.params)

// Check for specific routes we don't want to handle here
const isOpskriftPath = computed(() => 
  route.path.startsWith('/opskrifter/') && route.path !== '/opskrifter/'
)

// Check for specific pages that have their own component
const isDedicatedPage = computed(() => {
  const dedicatedPages = ['/favoritter', '/madplan']
  return dedicatedPages.includes(route.path)
})

// Kun vis indhold hvis det ikke er en opskriftsside eller dedikeret side
const showContent = computed(() => !isOpskriftPath.value && !isDedicatedPage.value)

// Simpelt check for at se om vi er på forsiden
const isHomepage = computed(() => route.path === '/')
</script>

<template>
  <div>
    <!-- For opskriftsider eller dedikerede sider, vis ingenting -->
    <div v-if="isOpskriftPath || isDedicatedPage">
      <!-- Denne del vil ikke blive vist, da andre komponenter har højere prioritet -->
    </div>
    
    <!-- For andre sider, inklusiv forsiden -->
    <div v-else>
      <!-- Vis RecipeGrid på forsiden -->
      <RecipeGrid v-if="isHomepage" />
      
      <!-- Vis indhold for andre sider -->
      <ContentDoc v-else :path="route.path">
        <!-- Fallback hvis indhold ikke findes -->
        <template #empty>
          <div class="error-container">
            <h2>Indhold ikke fundet</h2>
            <p>Vi kunne ikke finde det ønskede indhold.</p>
            <a href="/" class="back-link">Tilbage til forsiden</a>
          </div>
        </template>
        
        <!-- Loading state -->
        <template #loading>
          <div class="loading-container">
            <div class="loader"></div>
            <p>Indlæser indhold...</p>
          </div>
        </template>
      </ContentDoc>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  font-family: 'Lora', serif;
  color: #666;
  text-align: center;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(233, 30, 99, 0.2);
  border-radius: 50%;
  border-top-color: #e91e63;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  font-family: 'Lora', serif;
  text-align: center;
}

.error-container h2 {
  font-size: 2rem;
  color: #e91e63;
  margin-bottom: 1rem;
}

.error-container p {
  color: #555;
  margin-bottom: 2rem;
}

.back-link {
  padding: 10px 20px;
  background-color: #e91e63;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #c2185b;
}
</style>
