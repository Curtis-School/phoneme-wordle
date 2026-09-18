import { ok, withErrorHandling } from "@/lib/http";
import { buildSummary } from "@/lib/metrics/summary";

/**
 * GET /api/metrics/summary — the dashboard's KPI block.
 */
export const GET = withErrorHandling(async () => ok(await buildSummary()));
