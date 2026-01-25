export default {
  url:  import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

// The API client where roles (Employee, Representative) are defined
export const API_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_API_CLIENT_ID || 'quarkus-api';
