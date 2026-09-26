import { ok, parseQuery, withErrorHandling } from "@/lib/http";
import { listRecentEvents } from "@/lib/metrics/events";
import { eventsQuerySchema } from "@/lib/validation";

/** GET /api/metrics/events?limit=50&kind=generation_failed — the dashboard's reporting table. */
export const GET = withErrorHandling(async (request: Request) => {
  const { limit, offset, kind } = parseQuery(request, eventsQuerySchema);

  return ok(await listRecentEvents({ limit, offset, kind }));
});
