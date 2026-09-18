import type { EventKind } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Writes to the `ActivityEvent` log that every dashboard figure is derived from.
 *
 * Context is copied onto the row rather than referenced, so a report stays correct after
 * the activity or word list it describes has been deleted — see the schema comment.
 */
export type EventInput = {
  kind: EventKind;
  activityId?: number;
  /** "wordle" | "word_search" — copied from the activity at the time. */
  activityType?: string;
  difficulty?: string;
  wordListId?: number;
  /** The Wordle target word a generation drew. */
  wordId?: number;
  /** The `ApiError` code behind a failure, e.g. "UNSATISFIABLE". */
  errorCode?: string;
  durationMs?: number;
};

/**
 * Records one event, and never throws.
 *
 * Observability must not be able to break the thing it observes: a teacher's save should
 * still succeed if the log write fails. Failures go to stderr, where `docker compose logs`
 * will show them.
 */
export async function recordEvent(event: EventInput): Promise<void> {
  try {
    await prisma.activityEvent.create({ data: event });
  } catch (error) {
    console.error(`Failed to record "${event.kind}" event:`, error);
  }
}
