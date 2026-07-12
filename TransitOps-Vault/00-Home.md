# TransitOps Vault

Central context for hackathon contributors. Open this folder in **Obsidian**.

## Index

| Note | Purpose |
|------|---------|
| [[Architecture]] | Stack, folders, env |
| [[Features-by-Role]] | What each role can do (for testing) |
| [[Feature-Map]] | Where each PDF requirement lives in code |
| [[Hosting-Without-Docker]] | Neon / Render / Railway deploy |
| [[Testing-Checklist]] | Judge demo walkthrough |
| [[Changelog]] | Recent changes |

## Quick start (local)

```bash
docker compose up -d          # OR use Neon URL in server/.env
cd server && npm run db:setup
cd server && npm run dev
cd client && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000  

Password for all demo users: `Password@123`
