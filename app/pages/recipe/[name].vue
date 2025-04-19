<script setup>
const route = useRoute();
const name = route.params.name;

// Generer den korrekte opskriftssti
const targetPath = `/opskrifter/${name}`;

// Indlæs opskriften direkte her i stedet for at redirecte
const { data: recipe, pending, error } = await useAsyncData(`recipe-${name}`, () => {
  return queryContent(targetPath).first();
});

console.log('Opskrift indlæst:', recipe.value);
</script>

<template>
  <div>
    <!-- Vis loading-tilstand -->
    <div v-if="pending" class="loading-container">
      <div class="loader"></div>
      <p>Indlæser opskrift...</p>
    </div>
    
    <!-- Vis fejl, hvis noget gik galt -->
    <div v-else-if="error" class="error-container">
      <h2>Ups! Der opstod en fejl</h2>
      <p>Kunne ikke finde opskriften. Prøv at opdatere siden eller gå tilbage til forsiden.</p>
      <NuxtLink to="/" class="back-link">Tilbage til forsiden</NuxtLink>
    </div>
    
    <!-- Vis opskriften direkte her, når den er indlæst -->
    <div v-else-if="recipe">
      <RecipeRenderer :recipe="recipe" />
    </div>
    
    <!-- Fallback, hvis opskriften ikke findes -->
    <div v-else class="error-container">
      <h2>Opskrift ikke fundet</h2>
      <p>Vi kunne ikke finde opskriften. Prøv at opdatere siden eller vælg en anden opskrift.</p>
      <NuxtLink to="/" class="back-link">Tilbage til forsiden</NuxtLink>
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

.back-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #e91e63;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #c2185b;
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
</style>
