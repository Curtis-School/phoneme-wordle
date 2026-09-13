# Phoneme

A phoneme-based **activity builder** for Speech Pathology teachers — a Wordle and a Word
Search built from IPA sounds, exportable as self-contained `.html` files. Built for La Trobe
**CSE3CWA**.

| Folder | App | Port | Docs |
| --- | --- | --- | --- |
| [`frontend/`](frontend) | Next.js 16 UI (formerly `phoneme-wordle`) | 3000 | [README](frontend/README.md) |
| [`backend/`](backend) | Next.js 16 JSON API + Prisma/SQLite (formerly `phoneme-api`) | 3001 | [README](backend/README.md) |

Both apps' full commit histories are preserved in this repo.

## Run everything (Docker)

```bash
docker compose up --build
```

- App: http://localhost:3000
- API health: http://localhost:3001/health

The API applies migrations and seeds the database on start; the frontend waits until the API
reports healthy. The SQLite database lives on the `phoneme-data` volume, so saved activities
survive restarts. `docker compose down -v` discards it and starts fresh next time.

## Local development (no Docker)

Two terminals:

```bash
# 1. API — http://localhost:3001
cd backend
npm install
cp .env.example .env
npm run db:migrate && npm run db:seed
npm run dev
```

```bash
# 2. Frontend — http://localhost:3000
cd frontend
npm install
cp .env.example .env.local   # API_BASE_URL=http://localhost:3001
npm run dev
```
