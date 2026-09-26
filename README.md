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

Every command below runs from the repo root — the root `package.json` forwards each one
to `frontend/` or `backend/`.

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local   # API_BASE_URL=http://localhost:3001
npm run db:migrate && npm run db:seed
```

Then a terminal each:

```bash
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run db:seed` | Phonemes, words, word lists and starter activities |
| `npm run db:seed:events` | Adds 30 days of simulated usage for the dashboard |
| `npm run db:studio` | Browse the database |
| `npm run test:e2e` | Playwright end-to-end tests (starts both servers itself) |
| `npm run lint` | Lints both apps |
