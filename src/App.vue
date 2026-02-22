<template>
  <header v-if="isAuthenticated" class="app-header">
    <span class="brand">TID Issuer</span>
    <span class="user-info">{{ userRole }} · {{ userName }}</span>

    <button class="logout-btn" @click="logout">Logout</button>
  </header>

  <RouterView class="route-wrapper" />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';
import { API_CLIENT_ID } from './keycloak-config';

const { keycloak } = useKeycloak();

const isAuthenticated = computed(() => keycloak.authenticated);

const userName = computed(() => {
  if (!keycloak.authenticated) return '';
  const tp = keycloak.tokenParsed || {};
  return tp.name || tp.preferred_username || tp.email || 'user';
});

const userRole = computed(() => {
  if (!keycloak.authenticated) return '';
  if (keycloak.hasResourceRole('Employee', API_CLIENT_ID)) return 'Employee';
  if (keycloak.hasResourceRole('Representative', API_CLIENT_ID)) return 'Representative';
  return 'User';
});

function logout() {
  keycloak.logout({ redirectUri: window.location.origin });
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(6px);
}

.brand {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--brand-strong);
}

.user-info {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: default;
  margin-left: auto;
}

.logout-btn {
  background: var(--danger);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.95rem;
  font-size: 0.8rem;
  font-weight: 600;
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

.route-wrapper {
  padding: 1.4rem 0.2rem 0;
}

@media (max-width: 720px) {
  .app-header {
    flex-wrap: wrap;
  }

  .user-info {
    order: 3;
    margin-left: 0;
    width: 100%;
  }
}
</style>
