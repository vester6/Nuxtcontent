<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// Check if the current page is a recipe (in the opskrifter folder)
const isRecipe = computed(() => {
  return page.value?.path?.startsWith('/opskrifter/')
})
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
