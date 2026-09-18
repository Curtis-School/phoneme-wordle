import { ApiError, ok, parseQuery, withErrorHandling } from "@/lib/http";
import {
  buildWordleConfig,
  buildWordSearchConfig,
  loadActivityForGenerate,
} from "@/lib/generate";
import { recordEvent } from "@/lib/metrics/record";
import { generateQuerySchema, readIdParam } from "@/lib/validation";

type Context = RouteContext<"/api/activities/[id]/generate">;

type LoadedActivity = Awaited<ReturnType<typeof loadActivityForGenerate>>;

/**
 * GET /api/activities/:id/generate
 *
 * Turns a saved activity into everything the builder needs to render and export it.
 *
 * Repeated calls produce fresh puzzles. Still log as an event so the dashboard can report generation volume and
 * failures.
 */
export const GET = withErrorHandling(async (request: Request, ctx: Context) => {
  const id = await readIdParam(ctx.params);

  const { wordId, seed } = parseQuery(request, generateQuerySchema);

  const startedAt = Date.now();
  // Held outside the try so a failure can still be attributed to the right activity type.
  let activity: LoadedActivity | undefined;

  try {
    activity = await loadActivityForGenerate(id);

    const base = {
      activity: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        difficulty: activity.difficulty,
        wordList: { id: activity.wordList.id, name: activity.wordList.name },
      },
      // Exactly the frontend's `ActivitySettings`.
      settings: {
        theme: activity.theme,
        symbolDisplay: activity.symbolDisplay,
        showTooltips: activity.showTooltips,
      },
    };

    if (activity.type === "wordle") {
      const { config, wordId: chosen } = buildWordleConfig(activity, wordId);

      await recordSucceeded(activity, startedAt, chosen);

      // `wordId` is echoed back so the exact puzzle can be requested again.
      return ok({ ...base, config, wordId: chosen });
    }

    const { config, seed: usedSeed } = buildWordSearchConfig(activity, seed);

    await recordSucceeded(activity, startedAt);

    // The seed is returned so the caller can pass it to the grid generator and reproduce
    // this activity later.
    return ok({ ...base, config, seed: usedSeed });
  } catch (error) {
    await recordEvent({
      kind: "generation_failed",
      activityId: id,
      activityType: activity?.type,
      difficulty: activity?.difficulty,
      wordListId: activity?.wordListId,
      // The code is kept so the dashboard can separate saved data that can no longer
      // generate (UNSATISFIABLE) from a stale request or a genuine fault.
      errorCode: error instanceof ApiError ? error.code : "INTERNAL_ERROR",
      durationMs: Date.now() - startedAt,
    });

    throw error;
  }
});

function recordSucceeded(activity: LoadedActivity, startedAt: number, wordId?: number) {
  return recordEvent({
    kind: "generation_succeeded",
    activityId: activity.id,
    activityType: activity.type,
    difficulty: activity.difficulty,
    wordListId: activity.wordListId,
    wordId,
    durationMs: Date.now() - startedAt,
  });
}
