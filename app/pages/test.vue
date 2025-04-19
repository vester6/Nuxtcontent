<template>
  <div class="test-page">
    <h1>Test af indholdsvisning</h1>
    
    <div class="content-section">
      <h2>Direkte ContentDoc</h2>
      <ContentDoc path="/opskrifter/aeblekage" />
    </div>
    
    <hr>
    
    <div class="content-section">
      <h2>ContentList af opskrifter</h2>
      <ContentList path="/opskrifter" v-slot="{ list }">
        <ul>
          <li v-for="article in list" :key="article._path">
            <NuxtLink :to="article._path">{{ article.title }}</NuxtLink>
          </li>
        </ul>
        <p v-if="list.length === 0">Ingen opskrifter fundet med ContentList</p>
      </ContentList>
    </div>
    
    <hr>
    
    <div class="debug-section">
      <h2>Navigation til enkelte opskrifter</h2>
      <ul>
        <li><NuxtLink to="/opskrifter/aeblekage">Æblekage</NuxtLink></li>
        <li><NuxtLink to="/opskrifter/bananpandekager">Bananpandekager</NuxtLink></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  color: #d32f2f;
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  margin: 20px 0;
}

.content-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 30px 0;
}

.debug-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 6px;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}
</style>
