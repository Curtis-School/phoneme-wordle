import { ACTIVITY_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * The dashboard's KPI block.
 */

type Tally = Record<string, number>;

/** Collapses `groupBy` rows into `{ value: count }`, dropping rows whose key is null. */
function tally<T>(rows: T[], key: (row: T) => string | null): Tally {
  const counts: Tally = {};

  for (const row of rows) {
    const value = key(row);

    if (value !== null) {
      counts[value] = (counts[value] ?? 0) + countOf(row);
    }
  }

  return counts;
}

function countOf(row: unknown): number {
  return (row as { _count: { _all: number } })._count._all;
}

function sum(counts: Tally): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

/**
 * Fills in both activity types, so a dashboard card reads "0" for a type nothing has
 * happened to yet rather than omitting it.
 */
function byActivityType(counts: Tally) {
  return Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, counts[type] ?? 0]));
}

/** The busiest key, or null when there is nothing to rank. Ties break by name, so the answer is stable. */
function mostUsed(counts: Tally): string | null {
  const ranked = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([aKey, aCount], [bKey, bCount]) => bCount - aCount || aKey.localeCompare(bKey));

  return ranked[0]?.[0] ?? null;
}

function round(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

export async function buildSummary() {
  const [
    storedByType,
    eventsByKind,
    generationsByType,
    generationTiming,
    wordLists,
    words,
    phonemes,
    emptyWordLists,
    lastEvent,
    pageViewTotals,
    pageViewsByPath,
  ] = await Promise.all([
    prisma.activity.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.activityEvent.groupBy({ by: ["kind"], _count: { _all: true } }),
    prisma.activityEvent.groupBy({
      by: ["activityType"],
      where: { kind: "generation_succeeded" },
      _count: { _all: true },
    }),
    prisma.activityEvent.aggregate({
      where: { kind: "generation_succeeded" },
      _avg: { durationMs: true },
    }),
    prisma.wordList.count(),
    prisma.word.count(),
    prisma.phoneme.count(),
    prisma.wordList.count({ where: { items: { none: {} } } }),
    prisma.activityEvent.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.pageView.aggregate({ _avg: { dwellMs: true }, _count: { _all: true } }),
    prisma.pageView.groupBy({
      by: ["path"],
      _avg: { dwellMs: true },
      _count: { _all: true },
    }),
  ]);

  const stored = tally(storedByType, (row) => row.type);
  const kinds = tally(eventsByKind, (row) => row.kind);
  const generated = tally(generationsByType, (row) => row.activityType);

  const succeeded = kinds.generation_succeeded ?? 0;
  const failed = kinds.generation_failed ?? 0;
  const attempts = succeeded + failed;

  return {
    generatedAt: new Date().toISOString(),
    activities: {
      // What is saved right now, versus what the log says has happened over time. The two
      // differ by design: seeded activities were never "created" through the API, and a
      // deleted activity leaves its creation event behind.
      stored: sum(stored),
      storedByType: byActivityType(stored),
      created: kinds.activity_created ?? 0,
      updated: kinds.activity_updated ?? 0,
      deleted: kinds.activity_deleted ?? 0,
      /** Whichever type has been generated most — the rubric's "most-used activity type". */
      mostUsedType: mostUsed(generated) ?? mostUsed(stored),
    },
    generations: {
      succeeded,
      failed,
      attempts,
      /** Percentage to one decimal place, or null before anything has been generated. */
      successRate: attempts === 0 ? null : Math.round((succeeded / attempts) * 1000) / 10,
      byType: byActivityType(generated),
      averageDurationMs: round(generationTiming._avg.durationMs),
    },
    library: {
      wordLists,
      words,
      phonemes,
      /** Drives the "empty word list" warning on the dashboard. */
      emptyWordLists,
    },
    engagement: {
      pageViews: pageViewTotals._count._all,
      averageTimeOnPageMs: round(pageViewTotals._avg.dwellMs),
      byPath: pageViewsByPath
        .map((row) => ({
          path: row.path,
          views: row._count._all,
          averageMs: round(row._avg.dwellMs) ?? 0,
        }))
        .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path)),
    },
    events: {
      total: sum(kinds),
      byKind: kinds,
      lastEventAt: lastEvent?.createdAt ?? null,
    },
  };
}
