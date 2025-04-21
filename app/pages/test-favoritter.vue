<template>
  <div>
    <h1>Test Favoritter Side</h1>
    <p>Hvis du kan se denne side, fungerer routing til denne side korrekt.</p>
    <div>
      <a href="/" class="test-link">Tilbage til forsiden</a>
    </div>
  </div>
</template>

<script setup>
// Tom script-blok
</script>

<style scoped>
h1 {
  color: var(--color-primary);
  margin-bottom: 20px;
}

.test-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 15px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.test-link:hover {
  background-color: var(--color-primary-dark);
}
</style>
