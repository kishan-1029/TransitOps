# Hosting Without Docker Postgres

Primary DB: **Neon** (project `odoo2026`). No Docker required.

## Connection tips

- Prefer the **direct** host (`ep-....aws.neon.tech`) for Prisma — pooler (`-pooler`) can fail on cold start for migrations.
- Always include `sslmode=require` and optionally `connect_timeout=30`.
- Free tier compute sleeps; first query after idle may take a few seconds.

## Local `.env`

```
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
JWT_SECRET="change-me"
PORT=5000
CLIENT_ORIGIN="http://localhost:5173"
LOCKOUT_MINUTES=15
```

Then:

```bash
cd server
npx prisma db push
node prisma/seed.js
npm run dev
```

## Deploy

1. Keep Neon as production DB
2. Deploy API (Render/Railway) with same `DATABASE_URL`
3. Deploy client (Vercel) with `VITE_API_URL`
4. Set `CLIENT_ORIGIN` to frontend URL

## Security

Never commit `.env`. Rotate Neon password if it was shared in chat.
