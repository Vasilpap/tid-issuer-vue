<template>
  <div class="nf-wrapper">
    <h1>404 – Page not found</h1>
    <p>The page you’re looking for doesn’t exist.</p>
  </div>
</template>

<script setup>
// purely presentational – no logic needed
</script>

<style scoped>
.nf-wrapper {
  max-width: 560px;
  margin: 4rem auto;
  text-align: center;
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

p {
  color: #4b5563; /* gray-600 */
}
</style>
