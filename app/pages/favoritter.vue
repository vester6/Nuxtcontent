<template>
  <div class="favorites-page">
    <h1 class="page-title">Mine Favoritter</h1>
    
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Indlæser favoritter...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <h2>Kunne ikke indlæse opskrifter</h2>
      <p>{{ error }}</p>
      <button @click="fetchAllRecipes" class="retry-btn">Prøv igen</button>
    </div>
    
    <div v-else-if="!favoriteRecipes.length" class="empty-favorites">
      <p>Du har ikke markeret nogen opskrifter som favoritter endnu.</p>
      <a href="/" class="browse-link">Udforsk opskrifter</a>
    </div>
    
    <div v-else class="favorites-grid">
      <RecipeCard 
        v-for="recipe in favoriteRecipes" 
        :key="recipe._path || recipe.slug" 
        :recipe="recipe" 
        @favoriteToggled="handleFavoriteToggled"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import RecipeCard from '~/components/RecipeCard.vue';

// Favorit opskrifter
const favoriteRecipes = ref([]);
const favorites = ref([]);
const allRecipes = ref([]);
const loading = ref(true);
const error = ref(null);

// Indlæs favoritter fra localStorage
const loadFavorites = () => {
  try {
    // Tjek om vi er i en browser-kontekst (ikke på serveren)
    if (process.client) {
      const savedFavorites = localStorage.getItem('almasKokken_favorites');
      if (savedFavorites) {
        favorites.value = JSON.parse(savedFavorites);
        console.log('Loaded favorites:', favorites.value);
      }
    }
  } catch (err) {
    console.error('Fejl ved indlæsning af favoritter:', err);
    favorites.value = [];
  }
};

// Hent alle opskrifter fra API
const fetchAllRecipes = async () => {
  try {
    loading.value = true;
    const response = await fetch('/api/recipes');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched recipes:', data);
    allRecipes.value = data || [];
  } catch (err) {
    console.error('Fejl ved hentning af opskrifter:', err);
    error.value = err.message;
    allRecipes.value = [];
  } finally {
    loading.value = false;
  }
};

// Filtrer opskrifter baseret på favoritter
const filterFavoriteRecipes = () => {
  console.log('Filtering favorites. Favorites:', favorites.value);
  console.log('All recipes:', allRecipes.value);
  
  favoriteRecipes.value = allRecipes.value.filter(recipe => {
    // Få recept ID fra enten _path eller slug
    let recipeId = '';
    if (recipe._path) {
      recipeId = recipe._path.split('/').pop();
    } else if (recipe.slug) {
      recipeId = recipe.slug.split('/').pop();
    }
    
    const isFavorite = recipeId && favorites.value.includes(recipeId);
    console.log(`Recipe ${recipe.title} (${recipeId}): ${isFavorite ? 'is favorite' : 'not favorite'}`);
    
    return isFavorite;
  });
  
  console.log('Filtered favorite recipes:', favoriteRecipes.value);
};

// Håndter når en favorit ændres
const handleFavoriteToggled = (recipeId) => {
  console.log('Favorite toggled for:', recipeId);
  loadFavorites();
  filterFavoriteRecipes();
};

// Indlæs data ved opstart
onMounted(async () => {
  loadFavorites();
  await fetchAllRecipes();
  filterFavoriteRecipes();
  loading.value = false;
});

// Lyt efter ændringer i favoritter
watch(() => {
  if (process.client) {
    return localStorage.getItem('almasKokken_favorites')
  }
  return null
}, () => {
  loadFavorites();
  filterFavoriteRecipes();
}, { immediate: true });
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-text);
  font-size: 2rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.empty-favorites {
  text-align: center;
  padding: 50px 0;
  background-color: var(--color-background-secondary);
  border-radius: 10px;
  margin: 30px auto;
  max-width: 600px;
}

.empty-favorites p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.browse-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-link:hover {
  background-color: var(--color-primary-dark);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 50px 0;
  background-color: var(--color-background-secondary);
  border-radius: 10px;
  margin: 30px auto;
  max-width: 600px;
}

.retry-btn {
  background-color: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: var(--color-primary-dark);
}

/* Responsive styles */
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
