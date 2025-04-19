<script setup lang="ts">
const route = useRoute()

// Tilføj debug-log for at se hvordan data kommer ind
console.log('Route path:', route.path)

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

// Log page data før det sendes til komponenten
console.log('Page data from query:', page.value)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// Check if the current page is a recipe (in the opskrifter folder)
const isRecipe = computed(() => {
  return page.value?.path?.startsWith('/opskrifter/')
})

// Vi behøver ikke at ekstrahere meta-data her - RecipeRenderer henter det direkte
</script>

<template>
  <div>
    <!-- Brug RecipeRenderer til opskrifter -->
    <RecipeRenderer 
      v-if="page && isRecipe"
      :recipe="page"
    />
    
    <!-- Brug standard ContentRenderer til andet indhold -->
    <ContentRenderer
      v-else-if="page"
      :value="page"
    />
  </div>
</template>
