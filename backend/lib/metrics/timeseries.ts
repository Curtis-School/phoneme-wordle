import { prisma } from "@/lib/prisma";

type CountRow = { day: string; count: number | bigint };
type KindRow = CountRow & { kind: string };

export type TimeseriesPoint = {
  date: string;
  activitiesCreated: number;
  generationsSucceeded: number;
  generationsFailed: number;
  pageViews: number;
};

function toNumber(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function buildTimeseries(days: number) {
  const to = new Date();
  const from = new Date(to);

  from.setUTCDate(from.getUTCDate() - (days - 1));
  from.setUTCHours(0, 0, 0, 0);

  const since = from.toISOString();

  const [eventRows, pageViewRows] = await Promise.all([
    prisma.$queryRaw<KindRow[]>`
      SELECT date(createdAt) AS day, kind, COUNT(*) AS count
      FROM ActivityEvent
      WHERE createdAt >= ${since}
      GROUP BY day, kind
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT date(createdAt) AS day, COUNT(*) AS count
      FROM PageView
      WHERE createdAt >= ${since}
      GROUP BY day
    `,
  ]);

  const byDay = new Map<string, TimeseriesPoint>();

  // Charts need a bucket per day, including the quiet ones, or a gap reads as a dip.
  for (let offset = 0; offset < days; offset++) {
    const date = new Date(from);

    date.setUTCDate(date.getUTCDate() + offset);
    byDay.set(dayKey(date), {
      date: dayKey(date),
      activitiesCreated: 0,
      generationsSucceeded: 0,
      generationsFailed: 0,
      pageViews: 0,
    });
  }

  const FIELDS: Record<string, keyof Omit<TimeseriesPoint, "date">> = {
    activity_created: "activitiesCreated",
    generation_succeeded: "generationsSucceeded",
    generation_failed: "generationsFailed",
  };

  for (const row of eventRows) {
    const point = byDay.get(row.day);
    const field = FIELDS[row.kind];

    if (point && field) {
      point[field] += toNumber(row.count);
    }
  }

  for (const row of pageViewRows) {
    const point = byDay.get(row.day);

    if (point) {
      point.pageViews += toNumber(row.count);
    }
  }

  return {
    from: since,
    to: to.toISOString(),
    days,
    // Buckets are UTC days, so a late-evening local session lands on the next bucket.
    timezone: "UTC",
    points: [...byDay.values()],
  };
}
