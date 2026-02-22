# TID Issuer Frontend (Vue)

Vue 3 SPA for the TID Issuer workflow. It authenticates users with Keycloak and shows role-specific dashboards for representatives and employees.

## Stack

- Vue 3 + Vue Router
- Vite
- Keycloak JS integration (`@dsb-norge/vue-keycloak-js`)

## Roles and Views

- `Representative` -> registration dashboard
- `Employee` -> processing dashboard

Route guards enforce access based on Keycloak client roles from `quarkus-api`.

## Local Development

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`.

## Build and Quality

```bash
npm run build
npm run lint
npm run format
```

## Notes

- Configure backend URL with `VITE_API_BASE`.
- Keep real credentials out of git; commit only template env files.
