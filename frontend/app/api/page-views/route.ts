import { recordPageView } from "@/lib/api/client";

/**
 * Receives the dwell beacon and forwards it to the API, so `API_BASE_URL` stays on the
 * server and the browser never needs to know where the API lives.
 */
export async function POST(request: Request) {
  try {
    const { path, dwellMs, sessionId } = await request.json();

    await recordPageView({ path, dwellMs, sessionId });
  } catch {
    // Telemetry is never worth failing a visitor's page over; the API validates the rest.
  }

  return new Response(null, { status: 204 });
}
