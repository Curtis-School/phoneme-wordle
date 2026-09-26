#!/usr/bin/env bash
#
# Runs the load plan at each tier and writes a .jtl plus an HTML report per tier.
#
#   ./run.sh              # 1 10 100 1000
#   ./run.sh 1 10         # just those tiers
#   HOST=api PORT=3001 ./run.sh
#
set -euo pipefail

cd "$(dirname "$0")"

HOST="${HOST:-localhost}"
PORT="${PORT:-3001}"
LOOPS="${LOOPS:-5}"
# Which saved activity the generate sampler hits; any id from GET /api/activities.
ACTIVITY_ID="${ACTIVITY_ID:-1}"
TIERS=("${@:-1 10 100 1000}")

# Homebrew keeps the JDK keg-only, so make sure JMeter can find a runtime.
if ! command -v java >/dev/null 2>&1 && [ -d /opt/homebrew/opt/openjdk/bin ]; then
  export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
fi

mkdir -p results

for tier in ${TIERS[*]}; do
  # Ramp proportionally, so a tier starts over seconds rather than all at once.
  # RAMPUP overrides it; the top tier needs a shorter ramp to finish in a sane time.
  rampup="${RAMPUP:-$(( tier / 10 ))}"
  [ "$rampup" -lt 1 ] && rampup=1

  echo "== tier ${tier} users (ramp ${rampup}s, ${LOOPS} loops)"
  rm -rf "results/tier-${tier}.jtl" "results/tier-${tier}-report"

  jmeter -n -t phoneme-load.jmx \
    -Jhost="$HOST" -Jport="$PORT" -JactivityId="$ACTIVITY_ID" \
    -Jthreads="$tier" -Jrampup="$rampup" -Jloops="$LOOPS" \
    -l "results/tier-${tier}.jtl" \
    -e -o "results/tier-${tier}-report" \
    -j "results/tier-${tier}.log"
done

echo
echo "Done. Reports: testing/jmeter/results/tier-<n>-report/index.html"
