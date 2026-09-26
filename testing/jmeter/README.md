# JMeter load testing

`phoneme-load.jmx` drives the API at a configurable number of concurrent users. One plan
covers every tier: the thread count, ramp-up and loop count are JMeter properties rather
than four copies of the same thread group.

## Running

```bash
# From the repo root, with the API running (production build recommended):
npm run build --prefix backend && npm run start --prefix backend

# Then, from testing/jmeter:
ACTIVITY_ID=2 ./run.sh            # tiers 1, 10, 100, 1000
ACTIVITY_ID=2 ./run.sh 1 10       # just those tiers
LOOPS=1 RAMPUP=120 ./run.sh 10000 # the top tier, ramped faster
```

Each tier writes `results/tier-<n>.jtl` (raw samples) and `results/tier-<n>-report/`
(JMeter's HTML dashboard). Both are gitignored — they are demo evidence, not source.

| Variable | Default | Meaning |
| --- | --- | --- |
| `HOST` / `PORT` | `localhost` / `3001` | Where the API is listening |
| `ACTIVITY_ID` | `1` | Which saved activity the generate sampler uses |
| `LOOPS` | `5` | Iterations per virtual user |
| `RAMPUP` | tier ÷ 10 | Seconds to start all users |
| `HEAP` | JMeter default | e.g. `-Xms1g -Xmx6g` for the top tier |

## What it exercises

| Sampler | Why it is in the plan |
| --- | --- |
| `GET /health` | The liveness probe: must stay cheap under load |
| `GET /api/activities` | The most common read |
| `GET /api/metrics/summary` | The heaviest read — nine aggregates in one request |
| `GET /api/activities/:id/generate` | The only write path: it records an event and a request log row |
