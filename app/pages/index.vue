<template>
  <div class="recipe-home">
    <!-- Hero sektion med forsidetekst og baggrundsbillede -->
    <div class="hero-section">
      <!-- Baggrundsbillede i stedet for SVG mønster -->
      <div class="hero-image">
        <img src="/almaskoekken.png" alt="Almas Køkken" />
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
        <div v-for="recipe in filteredRecipes" :key="recipe.slug" class="recipe-grid-item">
          <!-- Brug standard HTML links for at sikre fuld side-genindlæsning og undgå SPA-routing-problemer -->
          <a :href="recipe.slug" class="recipe-card" onclick="window.location.href=this.getAttribute('href'); return false;">
            <div class="recipe-card-image" :style="getRecipeImageStyle(recipe)">
              <div class="time-badge">{{ recipe.time || '30' }} min</div>
              <div v-if="recipe.categories && recipe.categories.length > 0" class="category-badge">
                {{ recipe.categories[0] }}
              </div>
            </div>
            <div class="recipe-card-content">
              <h3>{{ recipe.title }}</h3>
              <p class="description">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="difficulty">{{ recipe.difficulty || 'Nem' }}</span>
                <span class="servings">{{ recipe.servings || '4' }} pers.</span>
              </div>
            </div>
          </a>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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
  
  // Tilfældigt baggrundsbillede baseret på kategorier eller slug
  let categoryClass = 'category-default';
  if (recipe.categories && recipe.categories.length > 0) {
    const category = recipe.categories[0].toLowerCase();
    if (category.includes('dessert')) categoryClass = 'category-dessert';
    else if (category.includes('bagværk')) categoryClass = 'category-bagvaerk';
    else if (category.includes('tradition')) categoryClass = 'category-tradition';
    else if (category.includes('international')) categoryClass = 'category-international';
  }
  
  return { backgroundColor: getCategoryColor(categoryClass) };
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
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-family: 'Lora', serif;
  font-size: 1rem;
  margin-bottom: 15px;
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
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: #e57373;
  color: white;
}

.filter-button.active {
  background-color: #c62828;
  color: white;
  border-color: #c62828;
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
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  text-decoration: none;
  color: inherit;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
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
  background-color: rgba(0,0,0,0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.category-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #c62828;
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
  color: #333;
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
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
