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
        <div class="recipe-image" :style="{ backgroundImage: `url(${getImage()})` }">
          <!-- SVG mønster baggrund kun hvis der ikke er et billede -->
          <div v-if="!recipe || !recipe.image || recipe.image === ''" class="pattern-overlay">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="recipe-checkerboard" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  <!-- Row 0 -->
                  <rect width="20" height="20" x="0" y="0" fill="#c62828"/>
                  <rect width="20" height="20" x="20" y="0" fill="#e57373"/>
                  <rect width="20" height="20" x="40" y="0" fill="#c62828"/>
                  <rect width="20" height="20" x="60" y="0" fill="#e57373"/>
                  <rect width="20" height="20" x="80" y="0" fill="#c62828"/>
                  <rect width="20" height="20" x="100" y="0" fill="#e57373"/>

                  <!-- Row 1 -->
                  <rect width="20" height="20" x="0" y="20" fill="#e57373"/>
                  <rect width="20" height="20" x="20" y="20" fill="#ffffff"/>
                  <rect width="20" height="20" x="40" y="20" fill="#e57373"/>
                  <rect width="20" height="20" x="60" y="20" fill="#ffffff"/>
                  <rect width="20" height="20" x="80" y="20" fill="#e57373"/>
                  <rect width="20" height="20" x="100" y="20" fill="#ffffff"/>

                  <!-- Row 2 -->
                  <rect width="20" height="20" x="0" y="40" fill="#c62828"/>
                  <rect width="20" height="20" x="20" y="40" fill="#e57373"/>
                  <rect width="20" height="20" x="40" y="40" fill="#c62828"/>
                  <rect width="20" height="20" x="60" y="40" fill="#e57373"/>
                  <rect width="20" height="20" x="80" y="40" fill="#c62828"/>
                  <rect width="20" height="20" x="100" y="40" fill="#e57373"/>

                  <!-- Row 3 -->
                  <rect width="20" height="20" x="0" y="60" fill="#e57373"/>
                  <rect width="20" height="20" x="20" y="60" fill="#ffffff"/>
                  <rect width="20" height="20" x="40" y="60" fill="#e57373"/>
                  <rect width="20" height="20" x="60" y="60" fill="#ffffff"/>
                  <rect width="20" height="20" x="80" y="60" fill="#e57373"/>
                  <rect width="20" height="20" x="100" y="60" fill="#ffffff"/>

                  <!-- Row 4 -->
                  <rect width="20" height="20" x="0" y="80" fill="#c62828"/>
                  <rect width="20" height="20" x="20" y="80" fill="#e57373"/>
                  <rect width="20" height="20" x="40" y="80" fill="#c62828"/>
                  <rect width="20" height="20" x="60" y="80" fill="#e57373"/>
                  <rect width="20" height="20" x="80" y="80" fill="#c62828"/>
                  <rect width="20" height="20" x="100" y="80" fill="#e57373"/>

                  <!-- Row 5 -->
                  <rect width="20" height="20" x="0" y="100" fill="#e57373"/>
                  <rect width="20" height="20" x="20" y="100" fill="#ffffff"/>
                  <rect width="20" height="20" x="40" y="100" fill="#e57373"/>
                  <rect width="20" height="20" x="60" y="100" fill="#ffffff"/>
                  <rect width="20" height="20" x="80" y="100" fill="#e57373"/>
                  <rect width="20" height="20" x="100" y="100" fill="#ffffff"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#recipe-checkerboard)" />
            </svg>
          </div>
        </div>
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

      <!-- Relaterede opskrifter sektion -->
      <RelatedRecipes 
        :current-recipe="recipe" 
        :current-slug="`/opskrifter/${name}`"
      />
      
      <!-- Tilbage til forsiden -->
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
  color: var(--color-text);
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
  padding: 0 20px;
  font-family: 'Lora', serif;
  color: var(--color-text);
}

.recipe-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  background: var(--color-card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px var(--color-card-shadow);
}

.recipe-image {
  height: 280px;
  background-size: cover;
  background-position: center;
  border-radius: 8px 8px 0 0;
  position: relative;
  overflow: hidden;
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.3;
  mix-blend-mode: multiply;
}

.pattern-overlay svg {
  width: 100%;
  height: 100%;
  display: block;
}

.recipe-header-content {
  padding: 20px;
  background-color: var(--color-card-background);
  border-radius: 10px;
  margin-top: -30px;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 15px var(--color-card-shadow);
}

.recipe-header-content h1 {
  margin: 0 0 15px;
  font-size: 2.2rem;
  color: var(--color-text);
}

.recipe-description {
  margin: 0 0 20px;
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.recipe-content {
  line-height: 1.8;
  color: var(--color-text);
}

.recipe-content h2 {
  font-size: 1.6rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10px;
}

.recipe-columns {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.recipe-ingredients {
  padding-right: 20px;
}

.recipe-ingredients ul {
  list-style-type: none;
  padding-left: 5px;
}

.recipe-ingredients li {
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border);
  position: relative;
}

.recipe-ingredients li::before {
  content: "•";
  color: var(--color-primary);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.recipe-instructions ol {
  padding-left: 25px;
  counter-reset: item;
}

.recipe-instructions li {
  margin-bottom: 15px;
  position: relative;
  padding-left: 10px;
  color: var(--color-text);
}

.recipe-instructions li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.recipe-tips {
  margin-top: 30px;
  padding: 15px;
  background-color: var(--color-card-background);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.recipe-tips h3 {
  color: var(--color-primary);
  margin-top: 0;
  margin-bottom: 10px;
}

.button-container {
  margin-top: 40px;
  text-align: center;
}

.back-button {
  display: inline-block;
  padding: 10px 20px;
  margin-top: 20px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: var(--color-primary-light);
}

.back-link {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 3px 8px var(--color-primary-muted);
}

.back-link:hover {
  background-color: var(--color-primary-light);
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
  color: var(--color-error);
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
    border-bottom: 1px solid var(--color-border);
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
