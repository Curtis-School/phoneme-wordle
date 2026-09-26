import { ok, withErrorHandling } from "@/lib/http";
import { buildAlerts } from "@/lib/metrics/alerts";

/** GET /api/metrics/alerts — stored data that cannot generate, and recent failures. */
export const GET = withErrorHandling(async () => ok(await buildAlerts()));
