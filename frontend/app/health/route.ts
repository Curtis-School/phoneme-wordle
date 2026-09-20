import { getApiHealth } from "@/lib/api/client";
import { SITE } from "@/lib/site";

/**
 * GET /health — liveness for the frontend itself.
 *
 * Always 200 when this server can answer at all, even if the API behind it is down. The
 * two services are checked separately: this endpoint answers "is the web app up?", and
 * the API's own /health answers "is the API up?". Folding the API's state into this
 * status code would make the frontend look dead when it is serving pages perfectly well.
 * The API's state is still reported, under `api`, and the dashboard renders it as an
 * alert.
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
