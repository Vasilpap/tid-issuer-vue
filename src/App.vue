<template>
  <!-- Global header: role · username · logout -->
  <header class="app-header">
    <span class="user-info">{{ userRole }} · {{ userName }}</span>

    <button class="logout-btn" @click="logout">Logout</button>
  </header>

  <!-- Route outlet -->
  <RouterView class="route-wrapper" />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();

// --- user info -----------------------------------------------------------
const userName = computed(() => {
  if (!keycloak.authenticated) return '';
  const tp = keycloak.tokenParsed || {};
  return tp.name || tp.preferred_username || tp.email || 'user';
});

const userRole = computed(() => {
  if (!keycloak.authenticated) return '';
  if (keycloak.hasRealmRole('Employee')) return 'Employee';
  if (keycloak.hasRealmRole('Representative')) return 'Representative';
  return 'User';
});

function logout() {
  keycloak.logout({ redirectUri: window.location.origin });
}
</script>

<style scoped>
/* Header container */
.app-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem; /* 12px 24px */
  background: #fff;
  border-bottom: 1px solid #e5e7eb; /* light gray */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Role · Username */
.user-info {
  font-size: 0.875rem; /* text-sm */
  font-weight: 600;
  color: #374151; /* gray-700 */
  cursor: default; /* plain text, not interactive */
}

/* Logout button */
.logout-btn {
  margin-left: auto;
  background: #dc2626; /* red-600 */
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.375rem 1rem; /* 6px 16px */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.logout-btn:hover {
  background: #b91c1c; /* red-700 */
}

.logout-btn:focus {
  outline: 2px solid #f87171; /* red-400 */
  outline-offset: 2px;
}

/* Route wrapper spacing */
.route-wrapper {
  padding: 1.5rem; /* 24px */
}
</style>
