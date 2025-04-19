<template>
  <div class="recipe-home">
    <!-- Hero sektion med forsidetekst -->
    <div class="hero-section">
      <div class="hero-content">
        <ContentDoc path="/" />
      </div>
    </div>
    
    <!-- Enkelt søgefelt -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Søg efter opskrifter..." 
        class="search-input" />
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

// Filtrér opskrifter baseret på søgning
const filteredRecipes = computed(() => {
  if (!recipes.value) return [];
  if (!searchQuery.value) return recipes.value;
  
  const query = searchQuery.value.toLowerCase();
  return recipes.value.filter(recipe => 
    recipe.title.toLowerCase().includes(query) || 
    recipe.description.toLowerCase().includes(query) ||
    (recipe.categories && recipe.categories.some(cat => cat.toLowerCase().includes(query)))
  );
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

.search-container {
  max-width: 600px;
  margin: 0 auto 40px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-family: 'Lora', serif;
  font-size: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
  background-color: rgba(233,30,99,0.8);
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
</style>
