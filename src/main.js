import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import VueKeycloak from '@dsb-norge/vue-keycloak-js';
import kcConfig from './keycloak-config';      // ↩︎ your Keycloak JSON

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                         */
/* ------------------------------------------------------------------ */
const app = createApp(App);

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
    /* ---------- 1. Role-based guard + smart root redirect ---------- */
    router.beforeEach((to, from, next) => {
      /* If the user just hit “/” (or refreshed at “/”), decide where to go */
      if (to.path === '/') {
        return next(
          keycloak.hasRealmRole('Representative')
            ? '/representative'
            : '/employee'
        );
      }

      /* All other paths: check route.meta.roles, if any */
      if (to.meta?.roles?.length) {
        const ok = to.meta.roles.some((r) => keycloak.hasRealmRole(r));
        if (!ok) return next('/unauthorized');
      }
      next();
    });

    /* ---------- 2. Ready—mount the SPA ---------- */
    app.use(router);
    app.mount('#app');
  },
});
