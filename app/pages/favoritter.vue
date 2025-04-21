<template>
  <div class="favorites-page">
    <h1 class="page-title">Mine Favoritter</h1>
    
    <div v-if="!favoriteRecipes.length" class="empty-favorites">
      <p>Du har ikke markeret nogen opskrifter som favoritter endnu.</p>
      <NuxtLink to="/" class="browse-link">Udforsk opskrifter</NuxtLink>
    </div>
    
    <div v-else class="favorites-grid">
      <RecipeCard 
        v-for="recipe in favoriteRecipes" 
        :key="recipe._path" 
        :recipe="recipe" 
        @favoriteToggled="handleFavoriteToggled"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecipeCard from '~/components/RecipeCard.vue';

// Favorit opskrifter
const favoriteRecipes = ref([]);
const favorites = ref([]);
const allRecipes = ref([]);

// Indlæs data ved opstart
onMounted(async () => {
  loadFavorites();
  await fetchAllRecipes();
  filterFavoriteRecipes();
});

// Indlæs favoritter fra localStorage
const loadFavorites = () => {
  const savedFavorites = localStorage.getItem('almasKokken_favorites');
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites);
  }
};

// Hent alle opskrifter fra API
const fetchAllRecipes = async () => {
  try {
    const response = await fetch('/api/recipes');
    const data = await response.json();
    allRecipes.value = data || [];
  } catch (error) {
    console.error('Fejl ved hentning af opskrifter:', error);
    allRecipes.value = [];
  }
};

// Filtrer opskrifter baseret på favoritter
const filterFavoriteRecipes = () => {
  favoriteRecipes.value = allRecipes.value.filter(recipe => {
    const recipeId = recipe._path?.split('/').pop();
    return recipeId && favorites.value.includes(recipeId);
  });
};

// Håndter når en favorit ændres
const handleFavoriteToggled = () => {
  loadFavorites();
  filterFavoriteRecipes();
};
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
