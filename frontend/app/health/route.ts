import { getApiHealth } from "@/lib/api/client";
import { SITE } from "@/lib/site";

/**
 * GET /health — liveness for the frontend
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const api = await getApiHealth();

  return Response.json({
    service: "phoneme-wordle",
    assessment: SITE.assessment,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    api,
  });
}
