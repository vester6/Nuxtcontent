<script setup>
const route = useRoute();
const name = route.params.name;

// Debug log
console.log('Opskriftsside indlæst med params:', route.params);

// Brug vores dedikerede API-endpoint med encode URI
const { data: recipe, pending, error } = await useFetch(`/api/recipe?name=${encodeURIComponent(name)}`);

// Log resultatet
console.log('API-svar modtaget:', recipe.value);

// Hjælpefunktion til at hente billedet
const getImage = () => {
  if (recipe.value && recipe.value.image) {
    return recipe.value.image;
  }
  return 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg';
};

// Hjælpefunktion til at formatere indholdet i et pænt layout
const formatRecipeContent = () => {
  if (!recipe.value || !recipe.value.body) return { ingredients: [], instructions: [] };
  
  const content = recipe.value.body;
  
  // Finder ingredienser og fremgangsmåde
  const ingrediensMatch = content.match(/Ingredienser(.*?)(?=Fremgangsmåde|$)/s);
  const fremgangsmådeMatch = content.match(/Fremgangsmåde(.*?)(?=Tips|$)/s);
  const tipsMatch = content.match(/Tips(.*?)$/s);
  
  // Formaterer ingredienser
  let ingredients = [];
  if (ingrediensMatch && ingrediensMatch[1]) {
    const ingrediensText = ingrediensMatch[1].trim()
      .replace(/###|##|#/g, '')
      .replace(/\*/g, '')
      .trim();
    
    ingredients = ingrediensText.split(/\n|(?:-\s)/)
      .filter(item => item.trim().length > 0)
      .map(item => item.trim().replace(/^-\s*/, ''));
  }
  
  // Formaterer fremgangsmåde
  let instructions = [];
  if (fremgangsmådeMatch && fremgangsmådeMatch[1]) {
    const fremgangsmådeText = fremgangsmådeMatch[1].trim()
      .replace(/###|##|#/g, '')
      .replace(/\*\*/g, '')
      .trim();
    
    instructions = fremgangsmådeText.split(/\d+\.\s+/)
      .filter(item => item.trim().length > 0)
      .map(item => item.trim());
  }
  
  // Formaterer tips
  let tips = '';
  if (tipsMatch && tipsMatch[1]) {
    tips = tipsMatch[1].trim()
      .replace(/###|##|#/g, '')
      .replace(/\*\*/g, '')
      .trim();
  }
  
  return { ingredients, instructions, tips };
};
</script>

<template>
  <div>
    <!-- Vis loading-tilstand -->
    <div v-if="pending" class="loading-container">
      <div class="loader"></div>
      <p>Indlæser opskrift...</p>
    </div>
    
    <!-- Vis fejlbesked hvis API returnerer en fejl -->
    <div v-else-if="error || (recipe && recipe.error)" class="error-container">
      <h2>Opskrift ikke fundet</h2>
      <p>Vi kunne ikke finde opskriften "{{ name }}". Prøv at vælge en anden opskrift.</p>
      <a href="/" class="back-link">Tilbage til forsiden</a>
    </div>
    
    <!-- Vis opskriften når den er indlæst -->
    <div v-else-if="recipe && !recipe.error" class="recipe-page">
      <!-- Opskriftens header med billede og meta-info -->
      <div class="recipe-header">
        <div class="recipe-image" :style="{ backgroundImage: `url(${getImage()})` }"></div>
        <div class="recipe-header-content">
          <h1>{{ recipe.title }}</h1>
          <p class="recipe-description">{{ recipe.description }}</p>
          <div class="recipe-meta">
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span>{{ recipe.time || 30 }} minutter</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👨‍🍳</span>
              <span>{{ recipe.difficulty || 'Nem' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🍽️</span>
              <span>{{ recipe.servings || 4 }} personer</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vis selve opskriftens indhold i to kolonner -->
      <div class="recipe-content">
        <div class="recipe-columns">
          <!-- Venstre kolonne: Ingredienser -->
          <div class="recipe-ingredients">
            <h2>Ingredienser</h2>
            <ul>
              <li v-for="(ingredient, index) in formatRecipeContent().ingredients" :key="index">
                {{ ingredient }}
              </li>
            </ul>
          </div>
          
          <!-- Højre kolonne: Fremgangsmåde -->
          <div class="recipe-instructions">
            <h2>Fremgangsmåde</h2>
            <ol>
              <li v-for="(instruction, index) in formatRecipeContent().instructions" :key="index">
                {{ instruction }}
              </li>
            </ol>
            
            <!-- Tips sektion -->
            <div v-if="formatRecipeContent().tips" class="recipe-tips">
              <h3>Tips</h3>
              <p>{{ formatRecipeContent().tips }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tilbage-knap til forsiden -->
      <div class="button-container">
        <a href="/" class="back-button">Tilbage til forsiden</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  font-family: 'Lora', serif;
  color: #666;
  text-align: center;
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

.recipe-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Lora', serif;
}

.recipe-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.recipe-image {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
}

.recipe-header-content {
  padding: 25px;
}

.recipe-header-content h1 {
  font-size: 2.2rem;
  margin: 0 0 15px 0;
  color: #333;
}

.recipe-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #555;
}

.meta-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

.recipe-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  line-height: 1.8;
}

/* To-kolonne layout */
.recipe-columns {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.recipe-ingredients {
  padding-right: 20px;
}

.recipe-ingredients h2,
.recipe-instructions h2 {
  font-size: 1.8rem;
  margin: 0 0 20px;
  color: #e91e63;
  border-bottom: 2px solid #f5c6d6;
  padding-bottom: 10px;
}

.recipe-ingredients ul {
  list-style-type: none;
  padding-left: 5px;
}

.recipe-ingredients li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  position: relative;
}

.recipe-instructions ol {
  padding-left: 25px;
  counter-reset: item;
}

.recipe-instructions li {
  margin-bottom: 15px;
  position: relative;
  padding-left: 10px;
}

.recipe-tips {
  margin-top: 30px;
  padding: 15px;
  background-color: #fff9e6;
  border-radius: 8px;
  border-left: 4px solid #e91e63;
}

.recipe-tips h3 {
  color: #e91e63;
  margin-top: 0;
  margin-bottom: 10px;
}

.button-container {
  margin-top: 40px;
  text-align: center;
}

.back-button, .back-link {
  display: inline-block;
  padding: 12px 24px;
  background-color: #e91e63;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s;
  box-shadow: 0 3px 8px rgba(233, 30, 99, 0.3);
}

.back-button:hover, .back-link:hover {
  background-color: #c2185b;
}

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  font-family: 'Lora', serif;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.error-container h2 {
  color: #e91e63;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .recipe-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .recipe-ingredients {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
  }
  
  .recipe-header {
    flex-direction: column;
  }
  
  .recipe-image {
    width: 100%;
    height: 200px;
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
