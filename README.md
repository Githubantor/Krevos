# Krevos — Crevos.Store

Luxury Menswear | Eid Edit 2026 — Vite + React + Tailwind + Express + MongoDB Atlas

## Live
- Frontend: `https://krevos.vercel.app` (after Vercel import)
- API: `/api/health`, `/api/products`, `/api/orders`, `/api/cluster` (every data in cluster)

## Stack
- Vite + React 19 + Tailwind 4
- Express 4 + Mongoose 8 + MongoDB Atlas `cluster0.ify2tzs.mongodb.net` (`crevos` db)
- Vercel (rewrites `/api/*` → `api/index.js`, SPA fallback to `/index.html`)

## Run Local
```cmd
npm install
npm run build
npm run server   # http://localhost:5000  (serves dist + API)
:: dev
npm run server   :: terminal 1
npm run dev      :: terminal 2 → http://localhost:5173 (proxy /api → 5000)
```

## Env
Copy `.env.example` → `.env` and set `MONGODB_URI=mongodb+srv://antor1234:KREVOSE@cluster0.ify2tzs.mongodb.net/crevos?...`

## Deploy to Vercel
1. Push to GitHub `Githubantor/Krevos`
2. Vercel → Add New Project → Import `Krevos` → Framework `Vite` → Build `npm run build` → Output `dist`
3. Env Vars → `MONGODB_URI` → Deploy → Live `https://krevos.vercel.app/api/cluster`

Admin: `/#admin` or `/admin` or `?admin` → password `admin123` (instant, no extra refresh — `src/App.jsx:180`)
