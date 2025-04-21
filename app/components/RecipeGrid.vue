<template>
  <div class="recipe-home">
    <div class="hero-section">
      <div class="hero-content">
        <ContentDoc />
      </div>
    </div>
    
    <div v-if="isLoaded">
      <div class="filter-bar" v-if="recipes.length > 0">
        <div class="categories">
          <button 
            class="category-button" 
            :class="{ active: activeCategory === 'all' }"
            @click="setCategory('all')">
            Alle opskrifter
          </button>
          <button 
            v-for="category in uniqueCategories" 
            :key="category"
            class="category-button" 
            :class="{ active: activeCategory === category }"
            @click="setCategory(category)">
            {{ category }}
          </button>
        </div>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Søg efter opskrifter..." 
            class="search-input" />
        </div>
      </div>

      <div class="recipe-count" v-if="recipes.length > 0">
        <span>{{ filteredRecipes.length }} opskrifter</span>
      </div>
      
      <div class="recipe-grid" v-if="recipes.length > 0">
        <div v-for="recipe in filteredRecipes" :key="recipe._path" class="recipe-grid-item">
          <RecipeCard :recipe="recipe" />
        </div>
      </div>
      
      <div v-else class="no-recipes">
        <p>Ingen opskrifter fundet. Tilføj nogle markdownfiler i <code>/content/opskrifter/</code> mappen.</p>
      </div>
    </div>
    
    <div v-else class="loading">
      <p>Indlæser opskrifter...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const recipes = ref([]);
const activeCategory = ref('all');
const searchQuery = ref('');
const isLoaded = ref(false);

// Hent alle opskrifter
onMounted(async () => {
  try {
    // Prøv at bruge den fulde, kanoniske sti uden leading slash
    recipes.value = await queryContent('opskrifter')
      .sort({ title: 1 })
      .find();
    
    console.log('Hentede opskrifter:', recipes.value);
    
    if (!recipes.value || !Array.isArray(recipes.value) || recipes.value.length === 0) {
      console.warn('No recipe data found or empty array');
      recipes.value = [];
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipes.value = [];
  } finally {
    isLoaded.value = true;
  }
});

// Filtrer opskrifter baseret på kategori og søgning
const filteredRecipes = computed(() => {
  if (!recipes.value || !Array.isArray(recipes.value)) {
    return [];
  }

  return recipes.value.filter(recipe => {
    // Kategorifilter
    if (activeCategory.value !== 'all') {
      const recipeCategories = recipe.meta?.categories || [];
      if (!recipeCategories.includes(activeCategory.value)) {
        return false;
      }
    }
    
    // Søgefilter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return (
        (recipe.title?.toLowerCase() || '').includes(query) ||
        (recipe.description?.toLowerCase() || '').includes(query) ||
        (recipe.meta?.categories || []).some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
});

// Få unikke kategorier fra alle opskrifter
const uniqueCategories = computed(() => {
  const categories = new Set();
  if (recipes.value && Array.isArray(recipes.value)) {
    recipes.value.forEach(recipe => {
      if (recipe.meta?.categories) {
        recipe.meta.categories.forEach(category => categories.add(category));
      }
    });
  }
  return Array.from(categories).sort();
});

// Sæt aktiv kategori
const setCategory = (category) => {
  activeCategory.value = category;
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
  padding: 60px 0;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #ffe6ea 0%, #f5c6d6 100%);
  border-radius: 12px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2.8rem;
  margin-bottom: 20px;
  color: #2c3e50;
}

.hero-content p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #555;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-button {
  padding: 8px 16px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-button:hover {
  background-color: #e0e0e0;
}

.category-button.active {
  background-color: #e91e63;
  color: white;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.recipe-count {
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #777;
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

.no-recipes {
  text-align: center;
  margin-bottom: 60px;
}

.loading {
  text-align: center;
  margin-bottom: 60px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
}
</style>
