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
reports healthy, and both services have their own healthcheck. The SQLite database lives on
the `phoneme-data` volume, so saved activities survive restarts. `docker compose down -v`
discards it and starts fresh next time.

`SEED_EVENTS=1` in `docker-compose.yml` also loads 30 days of simulated usage, so the
dashboard has something to report immediately. Set it to `0` for a deployment that should
only ever show the events it actually recorded.

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
| `npm run test:load` | JMeter load test (needs JMeter and a running API) |
| `npm run lint` | Lints both apps |

## What the app does

**Two builders.** `/wordle` and `/word-search` generate activities from stored word lists
and the Australian English phoneme inventory, playable in the browser and exportable as a
self-contained HTML file.

**A library.** `/library` is where the stored data is visible and editable: word lists with
their target sound, the words in each with their phoneme breakdowns, and the phoneme
inventory behind them.

**A dashboard.** `/dashboard` reports on the system while it runs — health, activities
stored versus created, generation success rate, average time on page, API latency and error
rate, daily trend charts, alerts, and a filterable, paginated event log.

### How the data flows

```
Browser ──▶ frontend (:3000) ──▶ API (:3001) ──▶ SQLite
                │                     │
                │                     ├─ domain tables: phonemes, words, word lists, activities
                │                     └─ metrics tables: ActivityEvent, PageView, RequestLog
                │
                └─ dwell beacon ──▶ /api/page-views ──▶ API
```

Every dashboard figure is **derived by query from an append-only event log**, not from
incremented counters. Nothing drifts, every number can be recomputed, and a deleted
activity keeps the history it generated — the event rows hold ids rather than foreign keys,
so the reporting table can still say "Deleted activity #15".

| Endpoint | Returns |
| --- | --- |
| `GET /health` | Liveness plus database reachability (both apps have one) |
| `GET /api/metrics/summary` | The KPI block: activities, generations, library, traffic, engagement |
| `GET /api/metrics/timeseries?days=30` | Daily buckets for the charts |
| `GET /api/metrics/alerts` | Stored data that cannot generate, and recent failures |
| `GET /api/metrics/events` | The reporting feed, paginated and filterable |
| `POST /api/page-views` | Dwell beacon from the browser |

## Testing

| What | How |
| --- | --- |
| End-to-end | `npm run test:e2e` — 15 Playwright tests covering the builder CRUD path and both user use cases |
| Load | `testing/jmeter/` — one parameterised plan, run at 1 / 10 / 100 / 1000 / 10000 users ([how to run](testing/jmeter/README.md)) |
| Accessibility | Lighthouse, 100 on all five routes |

Test output (`test-results/`, `playwright-report/`, JMeter `results/`) is deliberately
gitignored: it is demo evidence, reproduced by running the commands above.
