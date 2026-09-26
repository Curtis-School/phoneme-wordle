# Load test results

Measured against the **production build** of the API (`npm run build && npm start`), not the
dev server, so the numbers reflect the app rather than the bundler. SQLite on the local
disk, Apple Silicon laptop, JMeter 5.6.3 on OpenJDK 27.

Each virtual user loops five times through four requests: `/health`,
`/api/activities`, `/api/metrics/summary` and `/api/activities/:id/generate`.

## Throughput and latency by tier

| Users | Samples | Errors | Throughput | Avg | p50 | p95 | Max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 20 | 0% | 114/s | 8 ms | 6 ms | 19 ms | 23 ms |
| 10 | 200 | 0% | 175/s | 14 ms | 14 ms | 29 ms | 40 ms |
| 100 | 2,000 | 0% | 194/s | 23 ms | 18 ms | 56 ms | 93 ms |
| 1,000 | 20,000 | 0.26% | 165/s | 675 ms | 29 ms | 3,431 ms | 17,130 ms |
| 10,000 (capped at ~6,100) | 24,480 | 57.5% | 207/s | 10,142 ms | 15,545 ms | 15,551 ms | 18,661 ms |

## What the numbers show

**Throughput plateaus at roughly 190 requests per second.** From 10 to 100 users the
server absorbs the extra load with almost no cost — throughput rises and latency only
creeps up. Past that, adding users stops adding throughput and starts adding queueing:
at 1,000 users throughput actually *falls* to 165/s while the average response time grows
seventy-fold. That is the classic saturation knee, and it sits between 100 and 1,000
concurrent users for this deployment.

**The median stays healthy while the tail collapses.** At 1,000 users the p50 is 29 ms —
half of all requests are still fast — but the p95 is 3.4 seconds and the worst case is
17 seconds. Reporting an average alone would hide this: the average of 675 ms describes
almost none of the actual requests.

**The error rate stays near zero right up to the knee.** Even at 1,000 users only 0.26% of
requests failed, so the failure mode here is *slowness*, not rejection. A user would
experience the app as unresponsive well before it started returning errors.

## The surprise: `/health` is the slowest endpoint under load

At 1,000 users the per-endpoint split is counter-intuitive:

| Endpoint | Avg | p95 | Max |
| --- | ---: | ---: | ---: |
| `GET /health` | 2,568 ms | 7,437 ms | 17,130 ms |
| `GET /api/activities` | 99 ms | 55 ms | 17,064 ms |
| `GET /api/metrics/summary` | 22 ms | 29 ms | 77 ms |
| `GET /api/activities/:id/generate` | 9 ms | 15 ms | 32 ms |

The cheapest endpoint by design is the slowest under load, while the heaviest read
(`/api/metrics/summary`, nine aggregate queries) stays flat at ~22 ms.

The most likely explanation is **SQLite write contention**. Every other endpoint in the
plan writes a `RequestLog` row through `withErrorHandling`, and SQLite takes a database-wide
write lock. `/health` runs `SELECT 1` through Prisma, so it has to wait behind those
writes — and because it is the first request each virtual user makes, the queue forms
there first. `/api/metrics/summary` stays fast because its aggregates are index-backed
reads that are mostly served between write bursts.

This is a hypothesis consistent with the data, not a proven cause. Confirming it means
running a `/health`-only plan at the same tier: if it stays fast in isolation, contention
is confirmed. Worth doing before claiming it as fact.

## The 10,000-user tier

This tier could not be generated from one laptop. The JVM fails to create that many
native threads:

```
[warning][os,thread] Failed to start thread "Unknown thread" -
  pthread_create failed (EAGAIN) for attributes: stacksize: 2048k
[warning][os,thread] Failed to start the native thread for
  java.lang.Thread "Tier 10000 users 1-6121"
```

JMeter uses one OS thread per virtual user, so 10,000 users needs 10,000 threads. This
machine runs out at roughly 6,100. The first attempt with a proportional ramp (1,000 s)
was worse: the run ended with only ~6,100 of 10,000 threads ever started, which would have
been reported as a passing "10,000-user test" if the thread count had not been checked
against the sample count.

**Two separate ceilings show up at this tier, and they are worth telling apart.**

*The load generator* stops at roughly 6,100 users — that is the JVM thread limit above,
and it is a property of this laptop, not of the app.

*The API* fails before that point. Of the 24,480 requests that were generated, **57.5%
never got a response at all**:

```
Non HTTP response code: org.apache.http.conn.HttpHostConnectException   14,081
```

Connection *refused*, not a slow or erroring response — the server's accept queue is full,
so the OS rejects new connections outright. The requests that did connect averaged 10.1
seconds, with a median of 15.5 s. Every endpoint degrades together, which is what
saturation looks like: the queue, not any one route, is the constraint.

So the honest summary of this tier is: **the app serves roughly 190 requests per second
and degrades gracefully to about 1,000 concurrent users; somewhere between 1,000 and 6,100
it stops accepting connections.** Pinning that number down needs a load generator that can
exceed 6,100 users — distributed JMeter across several machines, or a tool that does not
map one user to one OS thread (k6, Gatling, wrk).

## What would raise the ceiling

1. **Postgres instead of SQLite** — the write lock is the bottleneck, and it is a property
   of SQLite rather than of the application code.
2. **Batch or sample the request logging.** Every API request currently costs a synchronous
   insert. Buffering rows and flushing periodically, or logging a sample of requests, would
   remove most of the write pressure while keeping the observability story.
3. **Leave `/health` out of the database path** — or keep its `SELECT 1` but serve a cached
   result for a second or two, so a liveness probe cannot queue behind application writes.
