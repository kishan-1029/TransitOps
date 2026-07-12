# TransitOps — Smart Transport Operations Platform

End-to-end fleet operations CRM for **Odoo Hackathon 2026** (8-hour build).

Digitizes **vehicle · driver · dispatch · maintenance · fuel/expenses · analytics** with enforced business rules and **JWT RBAC**.

---

## Live demo (reviewers start here)

| | |
|---|---|
| **App URL** | **[https://transitops-bg9b.onrender.com/](https://transitops-bg9b.onrender.com/)** |
| **Login** | [https://transitops-bg9b.onrender.com/login](https://transitops-bg9b.onrender.com/login) |
| **API health** | [https://transitops-bg9b.onrender.com/api/health](https://transitops-bg9b.onrender.com/api/health) |
| **API docs** | [https://transitops-bg9b.onrender.com/api-docs](https://transitops-bg9b.onrender.com/api-docs) |

> **Note:** Render free tier may cold-start (30–60s) after idle. Wait and refresh once if the first load is slow. Neon DB may also wake on first login.

### Reviewer quick login

On the login page, **click any role card** to auto-fill email + role.

**Password for every account:** `Password@123`

| Role | Email | Focus |
|------|-------|--------|
| Fleet Manager | `fleet@transitops.in` | Fleet, maintenance, lifecycle, efficiency |
| Driver | `raven.k@transitops.in` | Create trips, assign vehicle/driver, monitor deliveries |
| Dispatcher | `dispatch@transitops.in` | Same trip permissions as Driver (dispatch desk alias) |
| Safety Officer | `safety@transitops.in` | License validity, compliance, safety scores |
| Financial Analyst | `finance@transitops.in` | Fuel, expenses, costs, profitability |

Sidebar menus change by **RBAC** after login.

---

## What reviewers can verify

### Core modules
- **Dashboard** — KPIs (active/available vehicles, in maintenance, active/pending trips, drivers on duty, utilization) + filters (type / status / region); clickable KPIs open modules
- **Fleet** — Vehicle registry (unique reg. no., capacity, odometer, acquisition cost, status)
- **Drivers** — License, expiry, safety score, status filters (Expired / Expiring / Low Safety)
- **Trips** — Draft → Dispatched → Completed / Cancelled with capacity & license rules
- **Maintenance** — Active log → vehicle **In Shop** (hidden from dispatch); Close → **Available**
- **Fuel & Expenses** — Fuel logs, tolls, operational cost
- **Analytics** — Fuel efficiency, utilization, ops cost, Vehicle ROI, charts, **CSV** + **Print/PDF**
- **Settings** — Depot defaults + RBAC matrix

### Business rules (enforced)
- Unique vehicle registration number  
- Retired / In Shop vehicles never in dispatch pool  
- Expired license or Suspended drivers cannot be assigned  
- On Trip vehicle/driver cannot take another trip  
- Cargo weight ≤ vehicle capacity  
- Dispatch → On Trip; Complete / Cancel → Available  
- Active maintenance → In Shop; Close → Available (unless Retired)

### Extra features
- Dark / light theme  
- Mobile-responsive UI  
- Global header search (vehicles, drivers, trips)  
- TransitOps Assistant **chatbot**  
- Skeleton loaders + lazy-loaded pages  
- 24-hour JWT sessions · multi-user concurrent login  
- Timed lockout after 5 failed logins (15 minutes)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind + Recharts + Axios |
| Backend | Node.js (Express ESM) + Prisma + Zod + JWT |
| Database | Neon PostgreSQL |
| Hosting | Single-domain on **Render** (UI + API together) |

---

## Local development

### 1. `server/.env`

```env
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
DIRECT_URL="postgresql://USER:PASS@ep-xxxx.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
JWT_SECRET="transitops-hackathon-secret"
JWT_EXPIRES_IN="24h"
PORT=5000
CLIENT_ORIGIN="*"
LOCKOUT_MINUTES=15
```

### 2. Install & run

```bash
# API
cd server && npm install && npm run db:setup && npm run dev

# Client (separate terminal)
cd client && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000/api/health  

### 3. Same-domain production build (local)

```bash
# from repo root
npm run build
npm start
# open http://localhost:5000
```

More detail: [`TransitOps-Vault/Hosting-Without-Docker.md`](TransitOps-Vault/Hosting-Without-Docker.md)

---

## Suggested review path (5–8 min)

1. Open live link → click **Fleet Manager** → Sign In  
2. Dashboard KPIs + click through to Fleet / Trips  
3. Switch to **Driver** → create/dispatch/complete a trip (capacity rule)  
4. Switch to **Fleet Manager** → Maintenance → confirm vehicle goes **In Shop**  
5. **Safety Officer** → Drivers filters  
6. **Financial Analyst** → Fuel & Analytics (CSV / Print)  
7. Toggle **dark/light**, try **mobile width**, open **Ask** chatbot  

Video script (optional): [`TransitOps-Vault/Video-Presentation-Script.md`](TransitOps-Vault/Video-Presentation-Script.md)

---

## Repository layout

```
TransitOps/
  client/              React Vite app
  server/              Express API + Prisma
  TransitOps-Vault/    Architecture & presentation notes
  README.md
```

---

## Team notes

- Never commit `server/.env`  
- `npm run prisma:generate` (from `server`) stops port 5000 first to avoid Windows DLL lock  
- Cold start on Render/Neon is expected on free tier  

**Live:** [https://transitops-bg9b.onrender.com/](https://transitops-bg9b.onrender.com/)
