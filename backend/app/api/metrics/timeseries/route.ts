import { ok, parseQuery, withErrorHandling } from "@/lib/http";
import { buildTimeseries } from "@/lib/metrics/timeseries";
import { timeseriesQuerySchema } from "@/lib/validation";

/** GET /api/metrics/timeseries?days=30 — daily buckets for the dashboard charts. */
export const GET = withErrorHandling(async (request: Request) => {
  const { days } = parseQuery(request, timeseriesQuerySchema);

  return ok(await buildTimeseries(days));
});
