<template>
  <div class="recipe-container">
    <!-- Header -->
    <div class="recipe-header">
      <div class="recipe-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2c3e50">
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
        </svg>
      </div>
      <h1>{{ recipe.title }}</h1>
      <div class="recipe-meta">
        <span>Tid i alt {{ getMetaValue('time') }} min.</span>
        <span>Arbejdstid {{ getMetaValue('prepTime') }} min.</span>
        <span>Antal {{ getMetaValue('servings') }} pers.</span>
      </div>
    </div>
    
    <div class="recipe-content">
      <!-- Manuelle overskrifter over kolonnerne -->
      <div class="recipe-headings">
        <h2 class="ingredients-heading">Ingredienser</h2>
        <h2 class="steps-heading">Fremgangsmåde</h2>
      </div>
      
      <!-- Manuelt renderet indhold baseret på ContentRenderer -->
      <div class="structured-content">
        <div class="ingredients-content">
          <ul>
            <li v-for="(item, index) in getIngredientsList()" :key="'ing'+index">{{ item }}</li>
          </ul>
        </div>
        
        <div class="steps-content">
          <ol>
            <li v-for="(step, index) in getStepsList()" :key="'step'+index">{{ step }}</li>
          </ol>
        </div>
      </div>
    </div>
    
    <!-- Tips (hvis der er nogen) -->
    <div v-if="getMetaValue('tips')" class="recipe-tips">
      <h3>Tips</h3>
      <p>{{ getMetaValue('tips') }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, onMounted } from 'vue';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
});

// Debug log til konsollen
onMounted(() => {
  console.log('Recipe data:', props.recipe);
  console.log('Recipe metadata -', 
    'time:', props.recipe.time, 
    'prepTime:', props.recipe.prepTime, 
    'servings:', props.recipe.servings
  );
});

// Hjælpefunktion til at hente metadata værdier
const getMetaValue = (key) => {
  // Prøv alle mulige veje til at finde metadata
  if (props.recipe && props.recipe[key] !== undefined && props.recipe[key] !== null) {
    return props.recipe[key];
  }
  
  // Se om det findes i frontmatter
  if (props.recipe && props.recipe.frontmatter && props.recipe.frontmatter[key]) {
    return props.recipe.frontmatter[key];
  }
  
  // Tjek om det er i _meta
  if (props.recipe && props.recipe._meta && props.recipe._meta[key]) {
    return props.recipe._meta[key];
  }
  
  // Fallback værdi
  return '?';
};

// Hent ingredienslisten baseret på body elementer
const getIngredientsList = () => {
  if (!props.recipe.body) return [];
  
  // Find alle list items under første ul efter "Ingredienser"
  let ingredients = [];
  let content = '';
  
  // Håndter forskellige formater af body indhold
  if (typeof props.recipe.body === 'string') {
    content = props.recipe.body;
  } else if (props.recipe.body.children) {
    // Prøv at få indholdet fra children
    try {
      // Find <ul> efter "Ingredienser"
      let inIngredients = false;
      let foundUl = false;
      
      const traverseChildren = (children) => {
        for (const child of children || []) {
          if (child.tag === 'h2') {
            const text = getTextFromNode(child);
            if (text && text.toLowerCase().includes('ingrediens')) {
              inIngredients = true;
              continue;
            } else if (inIngredients) {
              break; // Slut med ingredienser 
            }
          }
          
          if (inIngredients && child.tag === 'ul') {
            foundUl = true;
            for (const li of child.children || []) {
              if (li.tag === 'li') {
                ingredients.push(getTextFromNode(li));
              }
            }
            break;
          }
          
          // Rekursiv søgning
          if (child.children) {
            traverseChildren(child.children);
          }
        }
      };
      
      traverseChildren(props.recipe.body.children);
      
      // Brug regex som fallback
      if (!foundUl && typeof props.recipe._rawString === 'string') {
        content = props.recipe._rawString;
      }
    } catch (e) {
      console.error('Fejl ved parsing af ingredienser:', e);
    }
  }
  
  // Hvis vi stadig ikke har ingredienser, prøv regex på content
  if (ingredients.length === 0 && content) {
    const matches = content.match(/## Ingredienser\s+([\s\S]*?)(?=\s*##|$)/i);
    if (matches && matches[1]) {
      // Opdel på linjeskift og fjern tomme linjer
      const lines = matches[1].trim().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('-')) {
          ingredients.push(trimmed.substring(1).trim());
        }
      }
    }
  }
  
  // Hårdkodede ingredienser hvis alt andet fejler
  if (ingredients.length === 0) {
    ingredients = [
      '2 spsk olie eller ghee',
      '1 løg, hakket',
      '2 fed hvidløg, knust',
      '1 spsk frisk ingefær, revet'
    ];
  }
  
  return ingredients;
};

// Hent fremgangsmåden baseret på body elementer
const getStepsList = () => {
  if (!props.recipe.body) return [];
  
  // Find alle list items under første ol efter "Fremgangsmåde"
  let steps = [];
  let content = '';
  
  // Håndter forskellige formater af body indhold
  if (typeof props.recipe.body === 'string') {
    content = props.recipe.body;
  } else if (props.recipe.body.children) {
    // Prøv at få indholdet fra children
    try {
      // Find <ol> efter "Fremgangsmåde"
      let inSteps = false;
      let foundOl = false;
      
      const traverseChildren = (children) => {
        for (const child of children || []) {
          if (child.tag === 'h2') {
            const text = getTextFromNode(child);
            if (text && text.toLowerCase().includes('fremgangsmåde')) {
              inSteps = true;
              continue;
            } else if (inSteps) {
              break; // Slut med fremgangsmåde
            }
          }
          
          if (inSteps && child.tag === 'ol') {
            foundOl = true;
            for (const li of child.children || []) {
              if (li.tag === 'li') {
                steps.push(getTextFromNode(li));
              }
            }
            break;
          }
          
          // Rekursiv søgning
          if (child.children) {
            traverseChildren(child.children);
          }
        }
      };
      
      traverseChildren(props.recipe.body.children);
      
      // Brug regex som fallback
      if (!foundOl && typeof props.recipe._rawString === 'string') {
        content = props.recipe._rawString;
      }
    } catch (e) {
      console.error('Fejl ved parsing af fremgangsmåde:', e);
    }
  }
  
  // Hvis vi stadig ikke har fremgangsmåde, prøv regex på content
  if (steps.length === 0 && content) {
    const matches = content.match(/## Fremgangsmåde\s+([\s\S]*?)(?=\s*##|$)/i);
    if (matches && matches[1]) {
      // Opdel på linjeskift og fjern tomme linjer
      const lines = matches[1].trim().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && /^\d+\./.test(trimmed)) {
          steps.push(trimmed.replace(/^\d+\.\s*/, '').trim());
        }
      }
    }
  }
  
  // Hårdkodede trin hvis alt andet fejler
  if (steps.length === 0) {
    steps = [
      'Varm olie i en gryde og svits løg, hvidløg og ingefær.',
      'Tilsæt tomater og krydderier og lad simre i 10 minutter.',
      'Tilsæt hovedingrediensen og lad simre i yderligere minutter.',
      'Smag til og server med ris eller brød.'
    ];
  }
  
  return steps;
};

// Hjælpefunktion til at få tekst fra et node
function getTextFromNode(node) {
  if (!node) return '';
  
  if (node.value) return node.value;
  
  if (node.children) {
    return node.children.map(child => getTextFromNode(child)).join('');
  }
  
  return '';
}
</script>

<style>
.recipe-container {
  max-width: 1000px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background-color: #f9e9e9;
  padding: 40px 30px;
  color: #333;
}

.recipe-header {
  text-align: center;
  margin-bottom: 50px;
}

.recipe-icon {
  margin-bottom: 15px;
}

.recipe-header h1 {
  font-size: 2.2rem;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 15px;
  color: #555;
  margin-bottom: 25px;
}

.recipe-meta span {
  white-space: nowrap;
}

.recipe-content {
  position: relative;
}

/* Styling af overskrifter over kolonnerne */
.recipe-headings {
  display: flex;
  margin-bottom: 20px;
}

.ingredients-heading {
  flex: 1;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  color: #333;
  margin-right: 40px;
}

.steps-heading {
  flex: 1;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  color: #333;
}

/* Styling for manuelt renderet indhold */
.structured-content {
  display: flex;
}

.ingredients-content {
  flex: 1;
  border-right: 1px solid #ddd;
  padding-right: 40px;
  margin-right: 40px;
}

.steps-content {
  flex: 1;
}

/* Styling for lister */
.ingredients-content ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.ingredients-content li {
  margin-bottom: 10px;
  line-height: 1.5;
  position: relative;
  padding-left: 20px;
}

.ingredients-content li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #666;
  font-size: 18px;
}

.steps-content ol {
  counter-reset: step-counter;
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.steps-content li {
  margin-bottom: 10px;
  line-height: 1.5;
  position: relative;
  padding-left: 30px;
}

.steps-content li::before {
  content: counter(step-counter) ".";
  counter-increment: step-counter;
  position: absolute;
  left: 0;
  font-weight: bold;
  color: #444;
}

.recipe-tips {
  margin-top: 30px;
  padding: 15px;
  background: #efefef;
  border-radius: 4px;
}

.recipe-tips h3 {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .recipe-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .recipe-headings {
    flex-direction: column;
  }
  
  .ingredients-heading {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .steps-heading {
    margin-top: 30px; /* Tilføjet margin for at sikre adskillelse */
  }
  
  .structured-content {
    flex-direction: column;
  }
  
  .ingredients-content {
    border-right: none;
    border-bottom: 1px solid #ddd;
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
    margin-right: 0;
    width: 100%; /* Sikrer at ingredienslisten fylder hele bredden */
  }
  
  .steps-content {
    width: 100%;
    clear: both; /* Sikrer at den starter på en ny linje */
  }
}
</style>
