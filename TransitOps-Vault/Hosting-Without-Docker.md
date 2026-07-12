# Hosting Without Docker Postgres

Primary DB: **Neon** (project `odoo2026`). No Docker required.

## Recommended: single domain (one Render URL)

UI + API on the same host. Express serves `client/dist` and `/api/*`.

### Render settings

1. **New → Web Service** → connect `kishan-1029/TransitOps`
2. **Root Directory:** leave **empty** (repo root)
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`
5. Environment:

```
DATABASE_URL=postgresql://...@ep-....neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://...@ep-....neon.tech/neondb?sslmode=require
JWT_SECRET=long-random-string
JWT_EXPIRES_IN=24h
CLIENT_ORIGIN=*
LOCKOUT_MINUTES=15
NODE_ENV=production
```

Do **not** set `VITE_API_URL` — the browser calls `/api` on the same domain.

After deploy open: `https://YOUR-SERVICE.onrender.com`  
Health: `https://YOUR-SERVICE.onrender.com/api/health`

### Local same-domain test

```bash
cd client && npm run build
cd ../server && npm start
# open http://localhost:5000
```

## Split hosting (optional)

1. Neon = DB  
2. Render/Railway = API only (`server` root)  
3. Vercel = client with `VITE_API_URL=https://api...`  
4. Set `CLIENT_ORIGIN` to the Vercel URL  

## Neon tips

- Prefer direct host (`ep-....aws.neon.tech`) with `sslmode=require`
- Free tier sleeps; first request after idle can be slow
- Never commit `.env`; rotate password if it was shared
