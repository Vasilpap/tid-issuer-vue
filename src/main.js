import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import VueKeycloak from '@dsb-norge/vue-keycloak-js';
import kcConfig, { API_CLIENT_ID } from './keycloak-config';

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                         */
/* ------------------------------------------------------------------ */
console.log('Starting application...');
console.log('Keycloak config:', kcConfig);

const app = createApp(App);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info);
};

app.use(VueKeycloak, {
  config: kcConfig,
  init: {
    onLoad: 'login-required',
    checkLoginIframe: false,
  },

  /* ──────────────────────────────────────────────────────────────────
   *  Runs WHEN - AND ONLY WHEN - Keycloak is fully initialised.
   *  We register our guards here so we can safely call hasRealmRole().
   * ────────────────────────────────────────────────────────────────── */
  onReady(keycloak) {
    console.log('Keycloak ready!');
    console.log('Authenticated:', keycloak.authenticated);
    console.log('Token parsed:', keycloak.tokenParsed);
    // Roles are client roles on quarkus-api, not realm roles
    const clientRoles = keycloak.tokenParsed?.resource_access?.[API_CLIENT_ID]?.roles || [];
    console.log(`Client roles (${API_CLIENT_ID}):`, clientRoles);

    // Helper to check client roles on the API client
    const hasRole = (role) => keycloak.hasResourceRole(role, API_CLIENT_ID);

    /* ---------- 1. Role-based guard + smart root redirect ---------- */
    router.beforeEach((to, from, next) => {
      console.log(`Navigating from ${from.path} to ${to.path}`);

      /* If the user just hit "/" (or refreshed at "/"), decide where to go */
      if (to.path === '/') {
        if (hasRole('Representative')) {
          console.log('User has Representative role, redirecting to /representative');
          return next('/representative');
        } else if (hasRole('Employee')) {
          console.log('User has Employee role, redirecting to /employee');
          return next('/employee');
        } else {
          console.log('User has no valid role, redirecting to /unauthorized');
          // User has no valid role
          return next('/unauthorized');
        }
      }

      /* All other paths: check route.meta.roles, if any */
      if (to.meta?.roles?.length) {
        const ok = to.meta.roles.some((r) => hasRole(r));
        console.log(`Route ${to.path} requires roles:`, to.meta.roles, 'User has access:', ok);
        if (!ok) return next('/unauthorized');
      }
      next();
    });

    /* ---------- 2. Ready—mount the SPA ---------- */
    console.log('Mounting Vue app...');
    app.use(router);
    app.mount('#app');
    console.log('App mounted successfully!');
  },

  onInitError(error) {
    console.error('Keycloak initialization error:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; max-width: 600px; margin: 4rem auto; text-align: center; font-family: sans-serif;">
        <h1 style="color: #dc2626;">Authentication Error</h1>
        <p>Failed to initialize authentication system.</p>
        <p style="color: #6b7280; margin-top: 1rem;">Error: ${error.message || error}</p>
        <p style="margin-top: 2rem;">
          <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
            Retry
          </button>
        </p>
      </div>
    `;
  },
});
