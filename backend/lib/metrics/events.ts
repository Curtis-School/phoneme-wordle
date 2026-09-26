import { prisma } from "@/lib/prisma";

export type RecentEventsQuery = {
  limit: number;
  offset: number;
  kind?: string;
};

export async function listRecentEvents({ limit, offset, kind }: RecentEventsQuery) {
  const [events, total] = await Promise.all([
    prisma.activityEvent.findMany({
      where: { kind },
      orderBy: { id: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.activityEvent.count({ where: { kind } }),
  ]);

  // Events keep ids rather than relations so they outlive what they describe; names are
  // resolved here and come back null once the row is gone.
  const activityIds = [
    ...new Set(events.flatMap((event) => (event.activityId === null ? [] : [event.activityId]))),
  ];
  const wordListIds = [
    ...new Set(events.flatMap((event) => (event.wordListId === null ? [] : [event.wordListId]))),
  ];

  const [activities, wordLists] = await Promise.all([
    activityIds.length === 0
      ? []
      : prisma.activity.findMany({
          where: { id: { in: activityIds } },
          select: { id: true, name: true },
        }),
    wordListIds.length === 0
      ? []
      : prisma.wordList.findMany({
          where: { id: { in: wordListIds } },
          select: { id: true, name: true },
        }),
  ]);

  const activityName = new Map(activities.map((row) => [row.id, row.name] as const));
  const wordListName = new Map(wordLists.map((row) => [row.id, row.name] as const));

  return {
    total,
    limit,
    offset,
    events: events.map((event) => ({
      id: event.id,
      kind: event.kind,
      activityId: event.activityId,
      activityName: event.activityId === null ? null : activityName.get(event.activityId) ?? null,
      activityType: event.activityType,
      difficulty: event.difficulty,
      wordListId: event.wordListId,
      wordListName: event.wordListId === null ? null : wordListName.get(event.wordListId) ?? null,
      errorCode: event.errorCode,
      durationMs: event.durationMs,
      createdAt: event.createdAt,
    })),
  };
}
