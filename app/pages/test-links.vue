<template>
  <div class="debug-page">
    <h1>Debug Opskriftslinks</h1>
    
    <div class="debug-section">
      <h2>ContentList - Nuxt Content Links</h2>
      <ContentList path="/opskrifter" v-slot="{ list }">
        <ul>
          <li v-for="item in list" :key="item._path">
            <div>
              <strong>Titel:</strong> {{ item.title }}<br>
              <strong>Path:</strong> {{ item._path }}<br>
              <strong>Link:</strong> <NuxtLink :to="item._path">{{ item.title }}</NuxtLink>
            </div>
          </li>
        </ul>
      </ContentList>
    </div>
  </div>
</template>

<style scoped>
.debug-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  font-family: system-ui, sans-serif;
}

h1 {
  margin-bottom: 30px;
  color: #e91e63;
}

h2 {
  margin-top: 30px;
  color: #333;
}

.debug-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
