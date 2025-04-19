<template>
  <div class="meal-planner-page">
    <h1 class="page-title">Ugentlig Madplan</h1>
    
    <div class="planner-container">
      <!-- Ugens dage med drop zones -->
      <div class="days-container">
        <div v-for="day in weekdays" :key="day.id" class="day-column">
          <h2 class="day-title">{{ day.name }}</h2>
          <div 
            class="meal-dropzone"
            @dragover.prevent
            @drop="onDrop($event, day.id)"
          >
            <div v-if="!getMealsForDay(day.id).length" class="empty-day">
              Træk opskrifter hertil
            </div>
            <div 
              v-for="meal in getMealsForDay(day.id)" 
              :key="meal.id"
              class="planned-meal"
            >
              <div class="meal-header">
                <h3>{{ meal.title }}</h3>
                <button class="remove-btn" @click="removeMeal(day.id, meal.id)">×</button>
              </div>
              <p class="meal-desc">{{ meal.description }}</p>
              <div class="meal-meta">
                <span>{{ meal.time || 30 }} min</span>
                <span>{{ meal.servings || 4 }} pers.</span>
              </div>
              <a :href="meal.slug" class="view-recipe">Se opskrift</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Shopping list -->
      <div class="shopping-list">
        <h2>Indkøbsliste</h2>
        <div v-if="!shoppingList.length" class="empty-list">
          Din indkøbsliste er tom. Tilføj opskrifter til madplanen for at generere en indkøbsliste.
        </div>
        <div v-else class="shopping-items">
          <div v-for="(category, index) in shoppingListByCategory" :key="index" class="category-group">
            <h3 class="category-title">{{ index }}</h3>
            <div v-for="item in category" :key="item.name" class="shopping-item">
              <label class="item-label">
                <input type="checkbox" v-model="item.checked" />
                <span :class="{ 'checked': item.checked }">{{ item.name }} ({{ item.amount }})</span>
              </label>
            </div>
          </div>
          
          <div class="shopping-actions">
            <button class="clear-btn" @click="clearCheckedItems">Fjern markerede varer</button>
            <button class="print-btn" @click="printShoppingList">Udskriv indkøbsliste</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Available recipes -->
    <div class="available-recipes">
      <h2>Tilgængelige Opskrifter</h2>
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Søg efter opskrifter..." 
          class="search-input" />
      </div>
      
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
          <div 
            v-for="recipe in filteredRecipes" 
            :key="recipe.slug" 
            class="recipe-card"
            draggable="true"
            @dragstart="onDragStart($event, recipe)"
          >
            <div class="recipe-card-image" :style="getRecipeImageStyle(recipe)">
              <div class="time-badge">{{ recipe.time || '30' }} min</div>
              <div v-if="recipe.categories && recipe.categories.length > 0" class="category-badge">
                {{ recipe.categories[0] }}
              </div>
            </div>
            <div class="recipe-card-content">
              <h3>{{ recipe.title }}</h3>
              <p class="description">{{ recipe.description }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Hent alle opskrifter fra API'en
const { data: recipes, pending, error } = await useFetch('/api/recipes');

// Ugens dage
const weekdays = [
  { id: 'mon', name: 'Mandag' },
  { id: 'tue', name: 'Tirsdag' },
  { id: 'wed', name: 'Onsdag' },
  { id: 'thu', name: 'Torsdag' },
  { id: 'fri', name: 'Fredag' },
  { id: 'sat', name: 'Lørdag' },
  { id: 'sun', name: 'Søndag' }
];

// Madplan og indkøbsliste
const mealPlan = ref({});
const shoppingList = ref([]);
const searchQuery = ref('');

// Kategorier til indkøbslisten
const ingredientCategories = {
  'Grøntsager': ['løg', 'hvidløg', 'tomat', 'kartoffel', 'gulerod', 'peberfrugt', 'salat', 'agurk', 'squash', 'aubergine'],
  'Frugt': ['æble', 'banan', 'citron', 'lime', 'appelsin', 'bær', 'jordbær', 'hindbær', 'blåbær'],
  'Kød': ['kylling', 'oksekød', 'svinekød', 'hakket', 'bacon', 'pølser', 'lam'],
  'Fisk & Skaldyr': ['laks', 'torsk', 'rejer', 'tun', 'fisk'],
  'Mejeriprodukter': ['mælk', 'fløde', 'ost', 'smør', 'yoghurt', 'cremefraiche'],
  'Bagning': ['mel', 'sukker', 'gær', 'bagepulver', 'vaniljesukker', 'chokolade'],
  'Kolonial': ['pasta', 'ris', 'couscous', 'bulgur', 'linser', 'bønner'],
  'Krydderier': ['salt', 'peber', 'karry', 'paprika', 'chili', 'kanel', 'vanille']
};

// Sorteret efter kategori
const shoppingListByCategory = computed(() => {
  const result = {};
  
  shoppingList.value.forEach(item => {
    let category = 'Andet';
    
    // Find kategori baseret på ingrediensnavnet
    for (const [cat, keywords] of Object.entries(ingredientCategories)) {
      if (keywords.some(keyword => item.name.toLowerCase().includes(keyword.toLowerCase()))) {
        category = cat;
        break;
      }
    }
    
    if (!result[category]) {
      result[category] = [];
    }
    
    result[category].push(item);
  });
  
  return result;
});

// Filtrerede opskrifter baseret på søgning
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

// Hjælpefunktion til at få alle måltider for en bestemt dag
const getMealsForDay = (dayId) => {
  return mealPlan.value[dayId] || [];
};

// Drag-and-drop håndtering
const onDragStart = (event, recipe) => {
  event.dataTransfer.setData('recipe', JSON.stringify(recipe));
};

// Drop handling
const onDrop = (event, dayId) => {
  const recipeData = event.dataTransfer.getData('recipe');
  if (recipeData) {
    const recipe = JSON.parse(recipeData);
    
    // Initialiser dag hvis den ikke findes
    if (!mealPlan.value[dayId]) {
      mealPlan.value[dayId] = [];
    }
    
    // Tilføj opskrift til dag
    const recipeWithId = { ...recipe, id: `${recipe.slug}-${Date.now()}` };
    mealPlan.value[dayId].push(recipeWithId);
    
    // Gem i localStorage
    saveMealPlan();
    
    // Opdater indkøbsliste
    updateShoppingList();
  }
};

// Fjern måltid fra en dag
const removeMeal = (dayId, mealId) => {
  if (mealPlan.value[dayId]) {
    mealPlan.value[dayId] = mealPlan.value[dayId].filter(meal => meal.id !== mealId);
    saveMealPlan();
    updateShoppingList();
  }
};

// Gem madplan i localStorage
const saveMealPlan = () => {
  localStorage.setItem('almasKokken_mealPlan', JSON.stringify(mealPlan.value));
};

// Indlæs madplan fra localStorage
const loadMealPlan = () => {
  const savedPlan = localStorage.getItem('almasKokken_mealPlan');
  if (savedPlan) {
    mealPlan.value = JSON.parse(savedPlan);
    updateShoppingList();
  }
};

// Simpel parsefunktion til at udtrække ingredienser fra opskriftstekster
// Dette er en meget simpel demo-version - en reel implementation ville bruge NLP
const parseIngredients = (recipe) => {
  if (!recipe.content) return [];
  
  const ingredients = [];
  const lines = recipe.content.split('\n');
  
  // Søg efter linjer der ligner ingredienser (starter med - eller *)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      // Forsøg at parsere mængde og navn
      const ingredientText = trimmed.substring(1).trim();
      const match = ingredientText.match(/^([\d\s,./]+)?\s*([a-zæøåA-ZÆØÅ].+)$/);
      
      if (match) {
        const amount = match[1] ? match[1].trim() : '';
        const name = match[2].trim();
        
        ingredients.push({
          name,
          amount,
          checked: false,
          recipe: recipe.title
        });
      }
    }
  }
  
  return ingredients;
};

// Opdater indkøbsliste baseret på valgte opskrifter
const updateShoppingList = async () => {
  // Nulstil indkøbsliste
  shoppingList.value = [];
  
  // For hver dag i madplanen
  for (const dayId in mealPlan.value) {
    const meals = mealPlan.value[dayId];
    
    // For hvert måltid på den dag
    for (const meal of meals) {
      // Hent detaljeret opskrift hvis vi ikke har indholdet
      if (!meal.content) {
        const { data } = await useFetch(`/api/recipe?name=${meal.slug.split('/').pop()}`);
        if (data.value) {
          // Opdater madplanen med det fulde indhold
          const mealIndex = mealPlan.value[dayId].findIndex(m => m.id === meal.id);
          if (mealIndex !== -1) {
            mealPlan.value[dayId][mealIndex] = { 
              ...mealPlan.value[dayId][mealIndex], 
              content: data.value.content 
            };
          }
          
          // Parse ingredienser og tilføj til indkøbslisten
          const ingredients = parseIngredients(data.value);
          mergeIngredients(ingredients);
        }
      } else {
        // Parse ingredienser fra indhold vi allerede har
        const ingredients = parseIngredients(meal);
        mergeIngredients(ingredients);
      }
    }
  }
  
  // Gem indkøbslisten i localStorage
  saveShoppingList();
};

// Kombinér ingredienser (saml ens ingredienser)
const mergeIngredients = (newIngredients) => {
  for (const newItem of newIngredients) {
    // Check om ingrediensen allerede findes
    const existingIndex = shoppingList.value.findIndex(
      item => item.name.toLowerCase() === newItem.name.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      // Hvis den findes, tilføj blot mængden (simpel version)
      shoppingList.value[existingIndex].amount += `, ${newItem.amount}`;
      shoppingList.value[existingIndex].recipe += `, ${newItem.recipe}`;
    } else {
      // Ellers tilføj den til listen
      shoppingList.value.push(newItem);
    }
  }
};

// Fjern markerede varer fra indkøbslisten
const clearCheckedItems = () => {
  shoppingList.value = shoppingList.value.filter(item => !item.checked);
  saveShoppingList();
};

// Gem indkøbslisten i localStorage
const saveShoppingList = () => {
  localStorage.setItem('almasKokken_shoppingList', JSON.stringify(shoppingList.value));
};

// Indlæs indkøbslisten fra localStorage
const loadShoppingList = () => {
  const savedList = localStorage.getItem('almasKokken_shoppingList');
  if (savedList) {
    shoppingList.value = JSON.parse(savedList);
  }
};

// Udskriv indkøbslisten
const printShoppingList = () => {
  window.print();
};

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

// Indlæs madplan og indkøbsliste ved opstart
onMounted(() => {
  loadMealPlan();
  loadShoppingList();
});
</script>

<style scoped>
.meal-planner-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Lora', serif;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.planner-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.day-title {
  text-align: center;
  font-size: 1rem;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #c62828;
}

.meal-dropzone {
  flex-grow: 1;
  min-height: 300px;
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-day {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-style: italic;
  border: 2px dashed #ddd;
  border-radius: 5px;
}

.planned-meal {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.meal-header h3 {
  font-size: 0.9rem;
  margin: 0;
  color: #333;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #c62828;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.meal-desc {
  font-size: 0.8rem;
  color: #666;
  margin: 5px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.meal-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
  margin-top: 5px;
}

.view-recipe {
  display: block;
  text-align: center;
  font-size: 0.8rem;
  color: #c62828;
  text-decoration: none;
  margin-top: 8px;
}

.shopping-list {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}

.shopping-list h2 {
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.shopping-items {
  max-height: 600px;
  overflow-y: auto;
}

.category-group {
  margin-bottom: 15px;
}

.category-title {
  font-size: 1rem;
  margin: 10px 0;
  color: #c62828;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.shopping-item {
  margin-bottom: 8px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.item-label input[type="checkbox"] {
  margin: 0;
}

.checked {
  text-decoration: line-through;
  color: #999;
}

.empty-list {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.shopping-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.clear-btn, .print-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn {
  background-color: #f5f5f5;
  color: #666;
}

.print-btn {
  background-color: #c62828;
  color: white;
}

.available-recipes {
  margin-top: 40px;
}

.available-recipes h2 {
  text-align: center;
  margin-bottom: 20px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-input {
  width: 100%;
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-family: 'Lora', serif;
  font-size: 1rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.recipe-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  cursor: grab;
  background: white;
}

.recipe-card:active {
  cursor: grabbing;
}

.recipe-card-image {
  height: 140px;
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
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
}

.category-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #c62828;
  color: white;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  text-transform: capitalize;
}

.recipe-card-content {
  padding: 15px;
}

.recipe-card-content h3 {
  margin: 0 0 5px;
  font-size: 1rem;
}

.description {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.loading-container, .error-container {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 0;
}

.loader {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(198, 40, 40, 0.2);
  border-radius: 50%;
  border-top-color: #c62828;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Print styles */
@media print {
  .days-container,
  .available-recipes,
  .view-recipe,
  .remove-btn,
  .search-container {
    display: none;
  }
  
  .planner-container {
    display: block;
  }
  
  .shopping-list {
    width: 100%;
    max-width: 100%;
    box-shadow: none;
    border: none;
  }
  
  .page-title:after {
    content: " - Indkøbsliste";
  }
  
  .shopping-actions {
    display: none;
  }
}

/* Responsive styles */
@media (max-width: 1024px) {
  .planner-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .days-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .meal-dropzone {
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  .days-container {
    grid-template-columns: 1fr;
  }
}
</style>
