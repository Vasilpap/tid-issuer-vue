import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueKeycloak from '@dsb-norge/vue-keycloak-js';
import kcConfig from './keycloak-config';

const app = createApp(App);

app.use(VueKeycloak, {
  config: kcConfig,
  init: {
    onLoad: 'login-required',     // enforce login
    checkLoginIframe: false,      // avoid iframe in dev; enable later if you like
  },
  /**
   * Runs once Keycloak finishes initialising.
   * We wait until then before mounting so the first
   * navigation already knows the user’s roles.
   */
  onReady(keycloak) {
    // Register a global beforeEach once we actually have the token
    router.beforeEach((to, from, next) => {
      // If the route needs roles, make sure the user has at least one of them
      if (to.meta?.roles?.length) {
        const ok = to.meta.roles.some(r => keycloak.hasRealmRole(r));
        if (!ok) return next('/unauthorized');
      }
      next();
    });

    app.use(router);
    app.mount('#app');
  },
});
