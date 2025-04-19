<template>
  <NuxtLink :to="recipe._path || '/'" class="recipe-card">
    <div class="recipe-card-image" :class="categoryClass">
      <div class="time-badge">{{ recipe.meta?.time || '?' }} min</div>
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
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
});

// Bestem kategorifarven baseret på den første kategori
const categoryClass = computed(() => {
  if (!props.recipe.meta?.categories || !Array.isArray(props.recipe.meta.categories) || props.recipe.meta.categories.length === 0) {
    return 'category-default';
  }
  
  const firstCategory = props.recipe.meta.categories[0].toLowerCase();
  
  switch(firstCategory) {
    case 'dessert':
      return 'category-dessert';
    case 'bagværk':
      return 'category-bagvaerk';
    case 'vegetar':
      return 'category-vegetar';
    case 'indisk':
    case 'asiatisk':
      return 'category-international';
    case 'tradition':
      return 'category-tradition';
    default:
      return 'category-default';
  }
});
</script>

<style scoped>
.recipe-card {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: white;
  text-decoration: none;
  color: inherit;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.recipe-card-image {
  height: 160px;
  position: relative;
  background-size: cover;
  background-position: center;
}

.category-default {
  background: linear-gradient(135deg, #f5c6d6 0%, #e91e63 100%);
}

.category-dessert {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.category-bagvaerk {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.category-vegetar {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
}

.category-international {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-tradition {
  background: linear-gradient(135deg, #c79081 0%, #dfa579 100%);
}

.time-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: 'Lora', serif;
}

.recipe-card-content {
  padding: 15px;
}

.recipe-card-content h3 {
  margin: 0 0 10px 0;
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  color: #2c3e50;
}

.description {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.5em;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #777;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.category-tag {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #555;
  font-weight: 500;
}
</style>
