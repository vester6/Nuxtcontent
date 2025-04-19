<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle" 
    :title="isDarkTheme ? 'Skift til lyst tema' : 'Skift til mørkt tema'"
    :aria-label="isDarkTheme ? 'Skift til lyst tema' : 'Skift til mørkt tema'"
  >
    <span class="sr-only">{{ isDarkTheme ? 'Skift til lyst tema' : 'Skift til mørkt tema' }}</span>
    <!-- Sol ikon (vises i mørkt tema) -->
    <svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <!-- Måne ikon (vises i lyst tema) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const isDarkTheme = ref(false);

// Skift mellem lyst og mørkt tema
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  updateTheme();
};

// Opdater tema baseret på valg
const updateTheme = () => {
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem('almasKokken_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark-theme');
    localStorage.setItem('almasKokken_theme', 'light');
  }
};

// Indlæs brugerens foretrukne tema fra localStorage ved kompnentindlæsning
onMounted(() => {
  const storedTheme = localStorage.getItem('almasKokken_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Brug gemt tema eller systemindstillinger
  isDarkTheme.value = storedTheme === 'dark' || (storedTheme === null && prefersDark);
  updateTheme();
  
  // Lyt også efter ændringer i systemindstillinger
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('almasKokken_theme') === null) {
      isDarkTheme.value = e.matches;
      updateTheme();
    }
  });
});
</script>

<style scoped>
.theme-toggle {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark-theme .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Skærmlæser-kun tekst */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
