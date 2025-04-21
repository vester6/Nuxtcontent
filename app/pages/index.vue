<template>
  <div class="recipe-home">
    <!-- Hero sektion med forsidetekst og baggrundsbillede -->
    <div class="hero-section">
      <!-- Baggrundsbillede i stedet for SVG mønster -->
      <div class="hero-image">
        <!-- Billede fjernet herfra -->
      </div>
      
      <div class="hero-content">
        <!-- Integreret søgefelt i hero-sektionen -->
        <div class="hero-search">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Søg efter opskrifter..." 
            class="search-input" />
          
          <!-- Kategorifiltre -->
          <div class="filter-buttons">
            <button 
              class="filter-button" 
              :class="{ active: selectedCategory === '' }" 
              @click="selectedCategory = ''">
              Alle
            </button>
            <button 
              v-for="category in uniqueCategories" 
              :key="category"
              class="filter-button"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category">
              {{ category }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recipe grid med dynamiske opskrifter -->
    <div class="recipe-grid">
      <div v-if="pending" class="loading-container">
        <div class="loader"></div>
        <p>Indlæser opskrifter...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <h2>Kunne ikke indlæse opskrifter</h2>
        <p>Der opstod en fejl. Prøv at genindlæse siden.</p>
      </div>
      
      <template v-else>
        <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.slug" :recipe="recipe" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import RecipeCard from '~/components/RecipeCard.vue';

// Hent alle opskrifter fra API'en
const { data: recipes, pending, error } = await useFetch('/api/recipes');

const searchQuery = ref('');
const selectedCategory = ref('');

// Beregn unikke kategorier fra alle opskrifter
const uniqueCategories = computed(() => {
  if (!recipes.value) return [];
  
  // Saml alle kategorier fra alle opskrifter
  const allCategories = [];
  recipes.value.forEach(recipe => {
    if (recipe.categories && Array.isArray(recipe.categories)) {
      allCategories.push(...recipe.categories);
    }
  });
  
  // Returner unikke kategorier sorteret alfabetisk
  return [...new Set(allCategories)].sort();
});

// Filtrér opskrifter baseret på søgning og valgt kategori
const filteredRecipes = computed(() => {
  if (!recipes.value) return [];
  
  return recipes.value.filter(recipe => {
    // Filtrer efter søgeord
    const matchesSearch = !searchQuery.value || 
      recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      recipe.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtrer efter kategori hvis en er valgt
    const matchesCategory = !selectedCategory.value || 
      (recipe.categories && recipe.categories.includes(selectedCategory.value));
    
    return matchesSearch && matchesCategory;
  });
});

// Hjælper til at generere baggrundsbillede stil
const getRecipeImageStyle = (recipe) => {
  if (recipe.image) {
    return { backgroundImage: `url(${recipe.image})` };
  }
  
  // Brug Almas Køkken billedet som standardbillede til opskrifter uden billede
  return { backgroundImage: `url("/almaskoekken.png")` };
};

// Hjælper til at få farve baseret på kategori
const getCategoryColor = (categoryClass) => {
  switch(categoryClass) {
    case 'category-dessert': return '#f9d5e5';
    case 'category-bagvaerk': return '#eeac99';
    case 'category-tradition': return '#e06377';
    case 'category-international': return '#5b9aa0';
    default: return '#d8e2dc';
  }
};
</script>

<style scoped>
.recipe-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Lora', serif;
}

.hero-section {
  text-align: center;
  padding: 0;
  margin-bottom: 30px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--color-card-shadow);
  max-height: none;
  height: auto;
}

.hero-image {
  width: 100%;
  height: auto;
  position: relative;
}

.hero-image img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 20px 30px;
}

.hero-search {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 12px;
}

.search-input {
  width: 100%;
  max-width: 100%; 
  padding: 12px 20px;
  border: 1px solid var(--color-input-border);
  border-radius: 30px;
  font-family: 'Lora', serif;
  font-size: 1rem;
  margin-bottom: 15px;
  background-color: var(--color-input-background);
  color: var(--color-text);
  box-sizing: border-box; 
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.filter-button {
  padding: 8px 16px;
  background-color: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.filter-button:hover {
  background-color: var(--color-primary-light);
  color: white;
}

.filter-button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.recipe-grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recipe-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--color-card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--color-card-background);
  text-decoration: none;
  color: inherit;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px var(--color-card-shadow);
}

.recipe-card-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.time-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--color-badge-background);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.category-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: var(--color-primary);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.recipe-card-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.recipe-card-content h3 {
  margin: 0 0 10px;
  font-size: 1.2rem;
  color: var(--color-text);
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-top: auto;
}

.loading-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
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
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 20px;
  color: #e91e63;
}

@media (max-width: 768px) {
  .hero-content {
    padding: 20px;
    margin: 0 15px;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
}
</style>
