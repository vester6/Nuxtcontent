<template>
  <div class="recipe-container">
    <!-- Header med info og baggrund -->
    <div class="recipe-header-container">
      <div 
        class="header-background"
        :style="getHeaderBackgroundStyle()"
      ></div>
      <div class="recipe-header-content">
        <h1>{{ recipe.title }}</h1>
        <div class="recipe-meta">
          <span>Tid i alt {{ getMetaValue('time') }} min.</span>
          <span>Arbejdstid {{ getMetaValue('prepTime') }} min.</span>
          <div class="servings-control">
            <span>Personer</span>
            <div class="servings-adjuster">
              <button @click="adjustServings(-1)" class="adjust-btn" :disabled="currentServings <= 1">-</button>
              <span>{{ currentServings }}</span>
              <button @click="adjustServings(1)" class="adjust-btn">+</button>
            </div>
          </div>
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
            <li v-for="(item, index) in scaledIngredients" :key="'ing'+index">{{ item }}</li>
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
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
});

// Base meta values
const baseServingsCount = computed(() => {
  // Forsøg at få servings fra forskellige mulige placeringer
  if (props.recipe.meta && props.recipe.meta.servings) {
    return parseInt(props.recipe.meta.servings) || 4;
  } else if (props.recipe.servings) {
    return parseInt(props.recipe.servings) || 4;
  }
  return 4; // Default antal personer
});

// Portionsstyring
const currentServings = ref(baseServingsCount.value);
const servingsScale = computed(() => currentServings.value / baseServingsCount.value);

function adjustServings(amount) {
  currentServings.value = Math.max(1, currentServings.value + amount);
}

// Genindlæs hvis opskriften ændrer sig
watch(() => props.recipe, () => {
  currentServings.value = baseServingsCount.value;
}, { deep: true });

// Metaværdier
const getMetaValue = (key) => {
  try {
    // Prøv først at få det fra meta-objektet
    if (props.recipe.meta && props.recipe.meta[key] !== undefined) {
      return props.recipe.meta[key];
    }
    
    // Prøv at få det direkte fra opskriften
    if (props.recipe[key] !== undefined) {
      return props.recipe[key];
    }
    
    // Fallback værdi
    return '?';
  } catch (error) {
    console.error('Error getting metadata value:', error);
    return '?';
  }
};

// Hjælper til at skalere en ingrediens baseret på antallet af personer
const scaleIngredient = (ingredient) => {
  // Hvis der ikke er nogen ændring i antallet eller skaleringsfaktoren er 1, returner uændret
  if (servingsScale.value === 1) {
    return ingredient;
  }
  
  console.log(`Scaling: ${ingredient} with factor ${servingsScale.value}`);
  
  // Regex til at finde mængdepatterns i starten af ingredienslinjen
  // Matcher fx: "2 spsk", "1/2 tsk", "1,5 dl", osv.
  const amountRegex = /^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(\w+)?\s+(.+)$/;
  const match = ingredient.match(amountRegex);
  
  if (match) {
    let [_, amount, unit, rest] = match;
    console.log(`Matched: amount=${amount}, unit=${unit}, rest=${rest}`);
    
    // Konverter til tal (inklusive eventuelle brøker)
    let numericAmount;
    if (amount.includes('/')) {
      const [numerator, denominator] = amount.split('/');
      numericAmount = parseFloat(numerator) / parseFloat(denominator);
    } else {
      numericAmount = parseFloat(amount.replace(',', '.'));
    }
    
    if (isNaN(numericAmount)) {
      console.log('Failed to parse amount:', amount);
      return ingredient;
    }
    
    // Beregn den nye mængde
    const newAmount = numericAmount * servingsScale.value;
    console.log(`New amount: ${newAmount}`);
    
    // Formater den nye mængde pænt
    let formattedAmount;
    if (Number.isInteger(newAmount)) {
      // Hele tal
      formattedAmount = newAmount.toString();
    } else if (Math.abs(newAmount - Math.round(newAmount * 2) / 2) < 0.01) {
      // Halve tal (0.5, 1.5, 2.5, etc.)
      const wholePart = Math.floor(newAmount);
      if (wholePart === 0) {
        formattedAmount = '½';
      } else {
        formattedAmount = `${wholePart}½`;
      }
    } else if (Math.abs(newAmount - Math.round(newAmount * 4) / 4) < 0.01) {
      // Kvarte (0.25, 0.75, 1.25, 1.75, etc.)
      const quarters = Math.round(newAmount * 4);
      const wholePart = Math.floor(quarters / 4);
      const fractionPart = quarters % 4;
      
      if (fractionPart === 0) {
        formattedAmount = wholePart.toString();
      } else if (fractionPart === 1) {
        formattedAmount = wholePart === 0 ? '¼' : `${wholePart}¼`;
      } else if (fractionPart === 2) {
        formattedAmount = wholePart === 0 ? '½' : `${wholePart}½`;
      } else { // fractionPart === 3
        formattedAmount = wholePart === 0 ? '¾' : `${wholePart}¾`;
      }
    } else {
      // Andre decimaltal - vises med én decimal hvis nødvendigt
      formattedAmount = newAmount.toFixed(1).replace(/\.0$/, '');
    }
    
    // Sæt det hele sammen igen
    return unit 
      ? `${formattedAmount} ${unit} ${rest}`
      : `${formattedAmount} ${rest}`;
  }
  
  // Hvis vi ikke kunne matche, returner uændret
  return ingredient;
};

// Hent ingredienslisten baseret på body elementer
const getIngredientsList = () => {
  console.log("Getting ingredients list. Current servings:", currentServings.value);
  
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
  
  console.log("Original ingredients:", ingredients);
  
  // Skaler ingredienserne baseret på antallet af personer
  const scaledIngredients = ingredients.map(scaleIngredient);
  console.log("Scaled ingredients:", scaledIngredients);
  
  return scaledIngredients;
};

const scaledIngredients = computed(() => {
  const ingredients = getIngredientsList();
  return ingredients.map(scaleIngredient);
});

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

// Tilføjer dynamisk baggrundsstil til header-baggrunden
function getHeaderBackgroundStyle() {
  // Tjek om opskriften har et billede
  if (recipe.image) {
    return {
      backgroundImage: `url(${recipe.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  // Brug Almas Køkken billedet som standardbillede
  return {
    backgroundImage: `url('/almaskoekken.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
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

.servings-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.servings-adjuster {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 3px 10px;
  border-radius: 20px;
}

.adjust-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: var(--color-primary, #e91e63);
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s, transform 0.1s;
}

.adjust-btn:hover:not(:disabled) {
  background-color: var(--color-primary-light, #f48fb1);
  transform: scale(1.1);
}

.adjust-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.adjust-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
