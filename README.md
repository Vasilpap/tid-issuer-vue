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

## Notes

- `VITE_API_BASE` can be empty when API is served via same-origin reverse proxy.
- Keep real secrets only in local `.env`.
