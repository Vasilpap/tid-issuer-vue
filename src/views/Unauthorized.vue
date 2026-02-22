<script setup>
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();

function logout() {
  keycloak.logout({ redirectUri: window.location.origin });
}
</script>

<template>
  <div class="unauthorized-wrapper">
    <h1>Access Denied</h1>
    <p>You don't have the required permissions to access this application.</p>
    <p class="details">
      Please contact your administrator to request access as either an <strong>Employee</strong> or <strong>Representative</strong>.
    </p>
    <button class="logout-btn" @click="logout">Logout</button>
  </div>
</template>

<style scoped>
.unauthorized-wrapper {
  max-width: 560px;
  margin: 4rem auto;
  text-align: center;
  padding: 2rem;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-soft);
}

h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #9f2928;
}

p {
  color: var(--muted);
  margin: 0.5rem 0;
  line-height: 1.6;
}

.details {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #f0c1c1;
}

.logout-btn {
  margin-top: 2rem;
  background: var(--danger);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.logout-btn:hover {
  background: #a93b3b;
  transform: translateY(-1px);
}

.logout-btn:focus {
  outline: 2px solid #e88584;
  outline-offset: 2px;
}
</style>
