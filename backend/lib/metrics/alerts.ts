import { plural } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { hasPhonemeCount } from "@/lib/words";

export type AlertSeverity = "error" | "warning";

export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
};

const RECENT_WINDOW_MS = 60 * 60 * 1000;

export async function buildAlerts() {
  const since = new Date(Date.now() - RECENT_WINDOW_MS);

  const [emptyLists, recentFailures, activitiesOnEmptyLists, wordleActivities] =
    await Promise.all([
      prisma.wordList.findMany({
        where: { items: { none: {} } },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.activityEvent.count({
        where: { kind: "generation_failed", createdAt: { gte: since } },
      }),
      prisma.activity.findMany({
        where: { wordList: { items: { none: {} } } },
        select: { id: true, name: true, wordList: { select: { name: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.activity.findMany({
        where: { type: "wordle" },
        select: {
          id: true,
          name: true,
          wordListId: true,
          wordLength: true,
          wordId: true,
          wordList: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  const wordleChecks = await Promise.all(
    wordleActivities.map(async (activity) => ({
      activity,
      eligible:
        activity.wordLength === null
          ? 0
          : await prisma.word.count({
              where: {
                listItems: { some: { wordListId: activity.wordListId } },
                ...hasPhonemeCount(activity.wordLength),
              },
            }),
      pinnedInList:
        activity.wordId === null
          ? true
          : (await prisma.wordListItem.findFirst({
              where: { wordListId: activity.wordListId, wordId: activity.wordId },
              select: { id: true },
            })) !== null,
    })),
  );

  const alerts: Alert[] = [];

  for (const { activity, eligible, pinnedInList } of wordleChecks) {
    if (activity.wordLength !== null && eligible === 0) {
      alerts.push({
        id: `wordle-unsatisfiable-${activity.id}`,
        severity: "error",
        title: `"${activity.name}" cannot be generated`,
        message: `"${activity.wordList.name}" holds no word with ${plural(activity.wordLength, "phoneme")}, so this Wordle fails every time it is opened.`,
      });
    }

    if (!pinnedInList) {
      alerts.push({
        id: `wordle-pin-missing-${activity.id}`,
        severity: "warning",
        title: `"${activity.name}" has lost its pinned word`,
        message: `The saved target word is no longer in "${activity.wordList.name}", so a random word is drawn instead.`,
      });
    }
  }

  for (const activity of activitiesOnEmptyLists) {
    alerts.push({
      id: `activity-empty-list-${activity.id}`,
      severity: "error",
      title: `"${activity.name}" cannot be generated`,
      message: `Its word list "${activity.wordList.name}" is empty.`,
    });
  }

  for (const list of emptyLists) {
    alerts.push({
      id: `empty-word-list-${list.id}`,
      severity: "warning",
      title: `"${list.name}" holds no words`,
      message: "An activity cannot be built from an empty list until words are added.",
    });
  }

  if (recentFailures > 0) {
    alerts.push({
      id: "recent-generation-failures",
      severity: "warning",
      title: `${plural(recentFailures, "failed generation")} in the last hour`,
      message: "Check the reporting table for the error codes behind them.",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      error: alerts.filter((alert) => alert.severity === "error").length,
      warning: alerts.filter((alert) => alert.severity === "warning").length,
    },
    alerts,
  };
}
