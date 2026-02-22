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
  padding: 2rem;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-soft);
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #1a3d4a;
}

p {
  color: var(--muted);
}
</style>
