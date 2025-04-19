<template>
  <div v-if="relatedRecipes && relatedRecipes.length > 0" class="related-recipes">
    <h2 class="related-title">Andre opskrifter du måske vil synes om</h2>
    <div class="related-grid">
      <div v-for="recipe in relatedRecipes" :key="recipe.slug" class="related-grid-item">
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
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentRecipe: {
    type: Object,
    required: true
  },
  currentSlug: {
    type: String,
    required: true
  }
});

// Hent alle opskrifter
const { data: allRecipes } = await useFetch('/api/recipes');

// Find relaterede opskrifter baseret på samme kategori
const relatedRecipes = computed(() => {
  if (!allRecipes.value || !props.currentRecipe) return [];
  
  // Hvis opskriften ikke har kategorier, returner 3 tilfældige opskrifter
  if (!props.currentRecipe.categories || props.currentRecipe.categories.length === 0) {
    return allRecipes.value
      .filter(recipe => recipe.slug !== props.currentSlug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  }
  
  // Find opskrifter med samme kategorier
  const relatedByCategory = allRecipes.value.filter(recipe => {
    // Skip den nuværende opskrift
    if (recipe.slug === props.currentSlug) return false;
    
    // Check om opskriften har kategorier
    if (!recipe.categories || recipe.categories.length === 0) return false;
    
    // Check om der er overlap mellem kategorierne
    return recipe.categories.some(category => 
      props.currentRecipe.categories.includes(category)
    );
  });
  
  // Hvis vi har nok relaterede opskrifter, returner 3 af dem
  if (relatedByCategory.length >= 3) {
    return relatedByCategory.slice(0, 3);
  }
  
  // Hvis vi ikke har nok relaterede opskrifter, fyld op med tilfældige
  const remainingCount = 3 - relatedByCategory.length;
  const otherRecipes = allRecipes.value
    .filter(recipe => {
      return recipe.slug !== props.currentSlug && 
        !relatedByCategory.some(r => r.slug === recipe.slug);
    })
    .sort(() => 0.5 - Math.random())
    .slice(0, remainingCount);
  
  return [...relatedByCategory, ...otherRecipes];
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
.related-recipes {
  margin-top: 60px;
  margin-bottom: 40px;
  padding-top: 30px;
  border-top: 2px dashed #eee;
}

.related-title {
  font-size: 1.8rem;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.related-grid-item {
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
  height: 150px;
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
  background-color: #c62828; /* Matcher farverne fra forsiden */
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.recipe-card-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.recipe-card-content h3 {
  margin: 0 0 10px;
  font-size: 1.1rem;
  color: #333;
}

.description {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  flex-grow: 1;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.8rem;
  margin-top: auto;
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
