<template>
  <div class="recipe-card-container" :draggable="draggable" @dragstart="onCardDragStart">
    <NuxtLink :to="recipe._path || '/'" class="recipe-card">
      <div class="recipe-card-image" :style="getRecipeImageStyle(recipe)">
        <div class="time-badge">{{ recipe.meta?.time || '?' }} min</div>
        <div v-if="recipe.meta?.categories && recipe.meta.categories.length" class="category-badge">
          {{ recipe.meta.categories[0] }}
        </div>
      </div>
      <div class="recipe-card-content">
        <h3>{{ recipe.title || 'Opskrift' }}</h3>
        <p class="description">{{ recipe.description || 'Ingen beskrivelse tilgængelig' }}</p>
        <div class="recipe-meta">
          <span class="difficulty">{{ recipe.meta?.difficulty || 'Nem' }}</span>
          <span class="servings">{{ recipe.meta?.servings || '4' }} pers.</span>
        </div>
        <div class="categories" v-if="recipe.meta?.categories && recipe.meta.categories.length">
          <span v-for="category in recipe.meta.categories" :key="category" class="category-tag">
            {{ category }}
          </span>
        </div>
      </div>
    </NuxtLink>
    <button 
      class="favorite-btn" 
      :class="{ 'active': isFavorite }"
      @click.prevent="toggleFavorite"
      aria-label="Tilføj til favoritter"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  },
  draggable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['dragstart', 'favoriteToggled']);

// Bestem baggrundsbillede for opskrift
const getRecipeImageStyle = (recipe) => {
  // Tjek om opskriften har et eget billede
  if (recipe.image || (recipe.meta && recipe.meta.image)) {
    const imagePath = recipe.image || recipe.meta.image;
    return { backgroundImage: `url(${imagePath})` };
  }
  
  // Brug almaskoekken.png som standard baggrundsbillede
  return { backgroundImage: `url("/almaskoekken.png")` };
};

// Håndter favoritter
const favorites = ref([]);
const recipePath = computed(() => props.recipe._path || '');
const recipeId = computed(() => recipePath.value.split('/').pop());

const isFavorite = computed(() => {
  return favorites.value.includes(recipeId.value);
});

// Indlæs favoritter fra localStorage ved opstart
onMounted(() => {
  const savedFavorites = localStorage.getItem('almasKokken_favorites');
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites);
  }
});

// Gem til localStorage når favoritter ændres
const saveFavorites = () => {
  localStorage.setItem('almasKokken_favorites', JSON.stringify(favorites.value));
};

// Toggle favorit status
const toggleFavorite = (event) => {
  event.stopPropagation();
  
  if (isFavorite.value) {
    // Fjern fra favoritter
    const index = favorites.value.indexOf(recipeId.value);
    if (index !== -1) {
      favorites.value.splice(index, 1);
    }
  } else {
    // Tilføj til favoritter
    favorites.value.push(recipeId.value);
  }
  
  // Gem ændringerne
  saveFavorites();
  
  // Emit event så forældre-komponenter kan reagere
  emit('favoriteToggled', recipeId.value);
};

// Drag-and-drop
const onCardDragStart = (event) => {
  // Send hele recipe-objektet til drag-and-drop API'et
  event.dataTransfer.setData('recipe', JSON.stringify(props.recipe));
  
  // Emit event for forældre
  emit('dragstart', event, props.recipe);
};
</script>

<style scoped>
.recipe-card-container {
  position: relative;
  width: 100%;
}

.recipe-card {
  display: block;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background-color: var(--color-card-background, white);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: var(--color-text, #333);
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.recipe-card-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.time-badge {
  position: absolute;
  top: 15px;
  right: 60px; /* Flyttet til venstre for at give plads til hjerteknappen */
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(240, 240, 240, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.favorite-btn svg {
  fill: #aaa;
  width: 24px;
  height: 24px;
  transition: fill 0.2s ease;
}

.favorite-btn:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.favorite-btn.active {
  background-color: var(--color-primary, #e91e63);
}

.favorite-btn.active svg {
  fill: white;
}

.category-badge {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: var(--color-primary, #e91e63);
  color: #fff;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.recipe-card-content {
  padding: 15px;
}

.recipe-card-content h3 {
  margin: 0 0 10px;
  font-size: 1.2rem;
  color: var(--color-text, #333);
}

.description {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.category-tag {
  display: inline-block;
  padding: 3px 8px;
  background-color: var(--color-background-tertiary, #f3f3f3);
  color: var(--color-text-secondary, #666);
  border-radius: 20px;
  font-size: 0.75rem;
}
</style>
