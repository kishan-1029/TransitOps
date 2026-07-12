# TransitOps — Smart Transport Operations Platform

End-to-end fleet CRM for Odoo Hackathon 2026.

**Contributor context:** open [`TransitOps-Vault/`](TransitOps-Vault/00-Home.md) in Obsidian.

## Stack

- **Frontend:** React + Vite + Tailwind + Recharts + Axios
- **Backend:** Node.js (Express ESM) + Prisma + Zod + JWT
- **Database:** Neon PostgreSQL (no Docker required)

## Quick start

### 1. Neon `server/.env`

```
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
DIRECT_URL="postgresql://USER:PASS@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
JWT_SECRET="transitops-hackathon-secret"
JWT_EXPIRES_IN="24h"
PORT=5000
CLIENT_ORIGIN="*"
LOCKOUT_MINUTES=15
```

### 2. Install & run (local)

```bash
cd server && npm install && npx prisma db push && node prisma/seed.js && npm run dev
cd client && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000/api/health  

### 3. Single-domain production (one Render URL)

```bash
# from repo root
npm run build
npm start
# open http://localhost:5000  → UI + API together
```

Deploy guide: [`TransitOps-Vault/Hosting-Without-Docker.md`](TransitOps-Vault/Hosting-Without-Docker.md)  
**Render:** root directory empty · Build `npm run build` · Start `npm start` · do not set `VITE_API_URL`

## Demo logins (`Password@123`)

| Email | Role |
|-------|------|
| raven.k@transitops.in | Driver |
| dispatch@transitops.in | Dispatcher |
| fleet@transitops.in | Fleet Manager |
| safety@transitops.in | Safety Officer |
| finance@transitops.in | Financial Analyst |

## Notes

- Header **Search** queries vehicles / drivers / trips
- Dashboard filters: Vehicle Type · Status · Region (side-by-side)
- JWT sessions last **24 hours**; many users can stay logged in at once
- 5 failed logins → account locked for **15 minutes**
