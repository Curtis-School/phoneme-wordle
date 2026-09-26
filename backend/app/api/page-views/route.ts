import { prisma } from "@/lib/prisma";
import { created, parseJsonBody, withErrorHandling } from "@/lib/http";
import { pageViewCreateSchema } from "@/lib/validation";

/** POST /api/page-views — how long a visitor spent on one route, reported as they leave it. */
export const POST = withErrorHandling(async (request: Request) => {
  const { path, dwellMs, sessionId } = await parseJsonBody(request, pageViewCreateSchema);

  const view = await prisma.pageView.create({
    data: { path, dwellMs, sessionId: sessionId ?? null },
    select: { id: true, path: true, dwellMs: true, createdAt: true },
  });

  return created(view);
});
