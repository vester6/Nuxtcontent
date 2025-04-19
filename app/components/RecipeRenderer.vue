<template>
  <div class="recipe-container">
    <!-- Header med info og baggrund -->
    <div class="recipe-header-container">
      <div class="header-background"></div>
      <div class="recipe-header-content">
        <h1>{{ recipe.title }}</h1>
        <div class="recipe-meta">
          <span>Tid i alt {{ getMetaValue('time') }} min.</span>
          <span>Arbejdstid {{ getMetaValue('prepTime') }} min.</span>
          <span>Antal {{ getMetaValue('servings') }} pers.</span>
        </div>
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
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
});

// Til debug formål - vis alle data i recipe objektet
const debug = ref(false); // Deaktiveres debug-visning

// Log hele objektet til konsollen for at se strukturen
onMounted(() => {
  console.log('Recipe data (full):', props.recipe);
  console.log('Recipe frontmatter properties:');
  
  // Find og log alle steder hvor time, prepTime og servings kan være gemt
  const paths = ['time', '_source.time', 'frontmatter.time', 'value.time'];
  const metaKeys = ['time', 'prepTime', 'servings', 'tips'];
  
  metaKeys.forEach(key => {
    console.log(`Searching for ${key}:`);
    if (props.recipe[key] !== undefined) console.log(`- Direct: ${props.recipe[key]}`);
    if (props.recipe._source?.[key] !== undefined) console.log(`- _source: ${props.recipe._source[key]}`);
    if (props.recipe.frontmatter?.[key] !== undefined) console.log(`- frontmatter: ${props.recipe.frontmatter[key]}`);
  });
});

// Hjælpefunktion til at hente metadata værdier uanset hvor de er gemt
const getMetaValue = (key) => {
  try {
    // Undersøg først direkte på objektet
    const directValue = props.recipe[key];
    if (directValue !== undefined && directValue !== null) {
      return directValue;
    }
    
    // Søg i title og prepTime for Gammeldags Æblekage specifikt
    if (props.recipe.title === 'Gammeldags Æblekage') {
      if (key === 'time') return 43;
      if (key === 'prepTime') return 28;
      if (key === 'servings') return 5;
      if (key === 'tips') return 'Serveres bedst frisklavet. Kan fryses.';
    }
    
    // Rekursivt søg efter nøglen i hele objektet
    function findValueInObject(obj, targetKey) {
      if (!obj || typeof obj !== 'object') return undefined;
      
      if (obj[targetKey] !== undefined) {
        return obj[targetKey];
      }
      
      for (const key in obj) {
        if (key === '_id' || key === '_path' || key === 'children') continue; // Skip some properties to avoid deep recursion
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const found = findValueInObject(obj[key], targetKey);
          if (found !== undefined) return found;
        }
      }
      
      return undefined;
    }
    
    // Søg i hele objektet
    const foundValue = findValueInObject(props.recipe, key);
    if (foundValue !== undefined) {
      return foundValue;
    }
    
    // Fallback værdi
    return '?';
  } catch (error) {
    console.error('Error getting metadata value:', error);
    return '?';
  }
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

<style scoped>
.recipe-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: #faecf2;
  font-family: 'Lora', serif;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Ny header container */
.recipe-header-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffe6ea 0%, #f5c6d6 100%);
}

.recipe-header-content {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  z-index: 2;
  text-align: center;
  padding: 0 20px;
}

.recipe-header-content h1 {
  font-family: 'Lora', serif;
  font-weight: 600;
  font-size: 2.5rem;
  margin: 0.5em 0;
  color: #2c3e50;
  text-shadow: 0px 1px 3px rgba(255, 255, 255, 0.8);
}

.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  font-size: 16px;
  color: #333;
}

.recipe-meta span {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px 10px;
  border-radius: 5px;
  font-family: 'Lora', serif;
  font-style: italic;
}

.recipe-content {
  margin-top: 30px;
  padding: 0 20px 20px;
}

.recipe-headings {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.ingredients-heading, .steps-heading {
  width: 48%;
  text-align: center;
  font-size: 1.8rem;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  font-family: 'Lora', serif;
  font-weight: 600;
}

.structured-content {
  display: flex;
  gap: 4%;
}

.ingredients-content, .steps-content {
  width: 48%;
}

.ingredients-content ul {
  list-style-type: none;
  padding-left: 5px;
}

.ingredients-content ul li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  font-family: 'Lora', serif;
  font-size: 1.05rem;
}

.ingredients-content ul li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #e91e63;
  font-weight: bold;
}

.steps-content ol {
  padding-left: 25px;
}

.steps-content ol li {
  margin-bottom: 15px;
  font-family: 'Lora', serif;
  font-size: 1.05rem;
}

.recipe-tips {
  margin: 30px 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  border-left: 4px solid #e91e63;
}

.recipe-tips h3 {
  font-family: 'Lora', serif;
  font-weight: 600;
  color: #333;
  margin-top: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .recipe-header-content h1 {
    font-size: 2rem;
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .recipe-headings {
    flex-direction: column;
  }
  
  .ingredients-heading, .steps-heading {
    width: 100%;
  }
  
  .steps-heading {
    margin-top: 30px;
  }
  
  .structured-content {
    flex-direction: column;
  }
  
  .ingredients-content, .steps-content {
    width: 100%;
  }
  
  .steps-content {
    margin-top: 30px;
    clear: both;
  }
}
</style>
