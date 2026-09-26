import type { PrismaClient } from "../lib/generated/prisma/client";
import { EVENT_KINDS } from "../lib/constants";

/**
 * Thirty days of plausible usage, so the dashboard has something to report before anyone
 * has used the app.
 *
 * Deterministic: the same seed produces the same history, and every run clears what the
 * previous one wrote, so re-seeding never stacks two histories on top of each other.
 */

const DAYS = 30;
const RNG_SEED = 20962451;

/** Same generator the activities use, so the whole project has one source of randomness. */
function mulberry32(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(RNG_SEED);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function between(min: number, max: number): number {
  return Math.floor(min + random() * (max - min));
}

/** Weekdays are busier than weekends, which is what a classroom tool looks like. */
function volumeFor(date: Date): number {
  const day = date.getUTCDay();
  const weekend = day === 0 || day === 6;

  return weekend ? between(0, 4) : between(4, 18);
}

function at(daysAgo: number, hour: number, minute: number): Date {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(hour, minute, between(0, 60), 0);

  return date;
}

const PAGES = ["/", "/wordle", "/word-search", "/library", "/dashboard"] as const;

const FAILURE_CODES = ["UNSATISFIABLE", "NOT_FOUND", "INTERNAL_ERROR"] as const;

const READ_PATHS = [
  { method: "GET", path: "/api/activities" },
  { method: "GET", path: "/api/word-lists" },
  { method: "GET", path: "/api/phonemes" },
  { method: "GET", path: "/api/metrics/summary" },
] as const;

export async function seedSimulatedHistory(prisma: PrismaClient) {
  const activities = await prisma.activity.findMany({
    select: { id: true, type: true, difficulty: true, wordListId: true },
  });

  if (activities.length === 0) {
    throw new Error("Seed the activities before the simulated history.");
  }

  const wordLists = await prisma.wordList.findMany({ select: { id: true } });

  await prisma.$transaction([
    prisma.activityEvent.deleteMany(),
    prisma.pageView.deleteMany(),
    prisma.requestLog.deleteMany(),
  ]);

  const events: {
    kind: string;
    activityId?: number;
    activityType?: string;
    difficulty?: string;
    wordListId?: number;
    wordId?: number;
    errorCode?: string;
    durationMs?: number;
    createdAt: Date;
  }[] = [];
  const pageViews: { path: string; dwellMs: number; sessionId: string; createdAt: Date }[] = [];
  const requests: {
    method: string;
    path: string;
    status: number;
    durationMs: number;
    createdAt: Date;
  }[] = [];

  for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
    const sessions = volumeFor(at(daysAgo, 9, 0));

    for (let session = 0; session < sessions; session++) {
      const hour = between(8, 17);
      const minute = between(0, 60);
      const sessionId = `seed-${daysAgo}-${session}`;
      const activity = pick(activities);

      // A visit: land somewhere, generate a puzzle or two, sometimes save one.
      for (const path of [pick(PAGES), "/wordle", "/dashboard"]) {
        pageViews.push({
          path,
          dwellMs: between(4_000, 240_000),
          sessionId,
          createdAt: at(daysAgo, hour, minute),
        });
        requests.push({
          method: "GET",
          path: "/api/activities",
          status: 200,
          durationMs: between(2, 40),
          createdAt: at(daysAgo, hour, minute),
        });
      }

      const generations = between(1, 5);

      for (let attempt = 0; attempt < generations; attempt++) {
        // Roughly one generation in twenty fails, which is what the failure card and the
        // alerts panel are there to surface.
        const failed = random() < 0.05;

        events.push({
          kind: failed ? "generation_failed" : "generation_succeeded",
          activityId: activity.id,
          activityType: activity.type,
          difficulty: activity.difficulty,
          wordListId: activity.wordListId,
          errorCode: failed ? pick(FAILURE_CODES) : undefined,
          durationMs: between(3, 60),
          createdAt: at(daysAgo, hour, minute),
        });

        const read = pick(READ_PATHS);

        requests.push({
          method: read.method,
          path: `/api/activities/${activity.id}/generate`,
          status: failed ? 409 : 200,
          durationMs: between(4, 90),
          createdAt: at(daysAgo, hour, minute),
        });
        requests.push({
          method: read.method,
          path: read.path,
          status: 200,
          durationMs: between(2, 45),
          createdAt: at(daysAgo, hour, minute),
        });
      }

      if (random() < 0.25) {
        events.push({
          kind: pick(["activity_created", "activity_updated", "activity_deleted"]),
          activityId: activity.id,
          activityType: activity.type,
          difficulty: activity.difficulty,
          wordListId: activity.wordListId,
          createdAt: at(daysAgo, hour, minute),
        });
        requests.push({
          method: "POST",
          path: "/api/activities",
          status: 201,
          durationMs: between(6, 120),
          createdAt: at(daysAgo, hour, minute),
        });
      }

      if (random() < 0.15 && wordLists.length > 0) {
        events.push({
          kind: pick(["word_list_created", "word_list_updated"]),
          wordListId: pick(wordLists).id,
          createdAt: at(daysAgo, hour, minute),
        });
      }
    }
  }

  const unknown = events.filter(
    (event) => !EVENT_KINDS.includes(event.kind as (typeof EVENT_KINDS)[number]),
  );

  if (unknown.length > 0) {
    throw new Error(`Simulated history produced unknown event kinds: ${unknown[0].kind}`);
  }

  await prisma.activityEvent.createMany({ data: events });
  await prisma.pageView.createMany({ data: pageViews });
  await prisma.requestLog.createMany({ data: requests });

  return { events: events.length, pageViews: pageViews.length, requests: requests.length };
}
