#!/bin/sh
# Applies migrations, seeds, then starts the server.
#
# SEED_EVENTS=1 also loads 30 days of simulated usage so the dashboard has something to
# report on a fresh volume. It rewrites the metrics tables, so it is opt-in rather than
# the default — a running deployment should keep the events it actually recorded.
set -e

npx prisma migrate deploy

if [ "${SEED_EVENTS:-0}" = "1" ]; then
  npm run db:seed:events
else
  npm run db:seed
fi

exec npm start
