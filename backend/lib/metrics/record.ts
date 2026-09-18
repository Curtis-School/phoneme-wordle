import type { EventKind } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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
 * Failures go to stderr, where `docker compose logs`
 * will show them.
 */
export async function recordEvent(event: EventInput): Promise<void> {
  try {
    await prisma.activityEvent.create({ data: event });
  } catch (error) {
    console.error(`Failed to record "${event.kind}" event:`, error);
  }
}
