<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';
import { API_CLIENT_ID } from '@/keycloak-config';

const router = useRouter();
const { keycloak } = useKeycloak();

const isAuthenticated = computed(() => Boolean(keycloak.authenticated));

const userName = computed(() => {
  const tp = keycloak.tokenParsed || {};
  return tp.name || tp.preferred_username || tp.email || 'user';
});

const userRole = computed(() => {
  if (!isAuthenticated.value) return null;
  if (keycloak.hasResourceRole('Representative', API_CLIENT_ID)) return 'Representative';
  if (keycloak.hasResourceRole('Employee', API_CLIENT_ID)) return 'Employee';
  return 'User';
});

const hasPortalRole = computed(() => ['Representative', 'Employee'].includes(userRole.value));

const entryPath = computed(() => {
  if (userRole.value === 'Representative') return '/representative';
  if (userRole.value === 'Employee') return '/employee';
  return '/unauthorized';
});

function login() {
  keycloak.login({ redirectUri: `${window.location.origin}/` });
}

function enter() {
  router.push(entryPath.value);
}
</script>

<template>
  <section class="home-wrapper">
    <div class="home-card">
      <p class="eyebrow">TID Issuer</p>
      <h1>Company registration portal</h1>
      <p class="intro">
        Sign in as a representative to submit registrations or as an employee to review pending requests.
      </p>

      <button v-if="!isAuthenticated" class="login-btn" @click="login">Log in with Keycloak</button>

      <div v-else class="session-area">
        <p class="session-text">
          Signed in as <strong>{{ userRole }}</strong>
          <span class="session-user">{{ userName }}</span>
        </p>
        <p v-if="!hasPortalRole" class="access-hint">
          Your account is authenticated but does not have an application role.
        </p>
        <button class="enter-btn" @click="enter">
          {{ hasPortalRole ? 'Enter portal' : 'View access details' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-wrapper {
  min-height: calc(100vh - 11rem);
  display: grid;
  place-items: center;
}

.home-card {
  width: min(640px, 100%);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  padding: 2rem;
  text-align: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--brand);
}

h1 {
  margin-top: 0.5rem;
  font-size: 2rem;
  line-height: 1.2;
  color: #163949;
}

.intro {
  margin-top: 0.8rem;
  color: var(--muted);
}

.login-btn {
  margin-top: 1.4rem;
  border: none;
  border-radius: 9px;
  background: var(--brand);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  padding: 0.7rem 1.2rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.login-btn:hover {
  background: var(--brand-strong);
  transform: translateY(-1px);
}

.session-area {
  margin-top: 1.3rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fffcf5;
  padding: 0.95rem;
}

.session-text {
  color: #2d3542;
}

.session-user {
  display: inline-block;
  margin-left: 0.45rem;
  color: var(--muted);
  font-weight: 600;
}

.access-hint {
  margin-top: 0.5rem;
  color: #8a5f1e;
  font-size: 0.93rem;
}

.enter-btn {
  margin-top: 0.8rem;
  border: none;
  border-radius: 9px;
  background: var(--brand);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  padding: 0.65rem 1.1rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.enter-btn:hover {
  background: var(--brand-strong);
  transform: translateY(-1px);
}
</style>
