# Architecture

## Stack

- **client/** — React 19 + Vite + Tailwind v4 + Recharts + Axios + React Router
- **server/** — Express ESM + Prisma + PostgreSQL + JWT + Zod
- **Auth** — email/password, role must match, lock after 5 fails
- **Theme** — `data-theme="light|dark"` via `ThemeContext`

## Layout

```
TransitOps/
  client/src/
    pages/          Login, Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel, Analytics, Settings
    context/        AuthContext, ThemeContext
    layouts/        AppLayout (sidebar + header)
    components/     ui.jsx (KPI, badges, forms)
  server/src/
    controllers/    auth, vehicle, driver, trip, maintenance, fuel, dashboard
    services/       tripService (business rules), maintenanceService
    utils/          rbac.js, response.js
  TransitOps-Vault/ Obsidian notes
```

## Env (`server/.env`)

```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/transitops?schema=public
JWT_SECRET=...
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## Roles (Prisma enum)

`FLEET_MANAGER` · `DRIVER` · `DISPATCHER` (alias of Driver rights) · `SAFETY_OFFICER` · `FINANCIAL_ANALYST`
