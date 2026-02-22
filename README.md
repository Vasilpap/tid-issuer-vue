# TID Issuer Frontend (Vue)

Single-page application for representative and employee workflows.

## Stack

- Vue 3 + Vue Router
- Vite
- Keycloak JS (`@dsb-norge/vue-keycloak-js`)

## Role-Based Views

- `Representative` -> registration dashboard
- `Employee` -> processing dashboard

Route guards validate `quarkus-api` client roles.

## Authentication Flow

- Keycloak JS initializes on app startup.
- User roles are read from Keycloak client roles on `quarkus-api`.
- Router guards redirect unauthorized users to `/unauthorized`.
- API calls are sent with Bearer token after successful login.

## Local Run

1. Copy env file:

```bash
cp .env.example .env
```

2. Install and start:

```bash
npm install
npm run dev
```

Dev URL: `http://localhost:5173`.

## Build / Lint / Format

```bash
npm run build
npm run lint
npm run format
```

Preview production build locally:

```bash
npm run build
npm run preview
```

## Notes

- `VITE_API_BASE` can be empty when API is served via same-origin reverse proxy.
- `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, and `VITE_KEYCLOAK_CLIENT_ID` must match deployed Keycloak values.
- Keep real secrets only in local `.env`.
