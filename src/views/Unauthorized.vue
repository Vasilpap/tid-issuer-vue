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
}

h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #dc2626; /* red-600 */
}

p {
  color: #4b5563; /* gray-600 */
  margin: 0.5rem 0;
  line-height: 1.6;
}

.details {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef2f2; /* red-50 */
  border-radius: 8px;
  border: 1px solid #fecaca; /* red-200 */
}

.logout-btn {
  margin-top: 2rem;
  background: #dc2626; /* red-600 */
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}

.logout-btn:hover {
  background: #b91c1c; /* red-700 */
}

.logout-btn:focus {
  outline: 2px solid #f87171; /* red-400 */
  outline-offset: 2px;
}
</style>
