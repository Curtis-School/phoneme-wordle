import { HealthTile } from "@/components/dashboard/HealthTile";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { PageShell } from "@/components/ui/PageShell";
import { ApiClientError, getApiHealth, getMetricsSummary } from "@/lib/api/client";
import type { ActivityType, MetricsSummary } from "@/lib/api/types";

/**
 * Operational view of the builder: is it healthy, what has been built, and what has been
 * generated from it.
 *
 * Rendered per request. Every figure is read from the API's event log, so a cached page
 * would report the past while claiming to report the present.
 */
export const dynamic = "force-dynamic";

const INTRO =
  "Live view of the activity builder — health, stored data and how the saved activities are being generated. Every figure is derived from the API's event log.";

const TYPE_LABELS: Record<ActivityType, string> = {
  wordle: "Wordle",
  word_search: "Word Search",
};

const numbers = new Intl.NumberFormat("en-AU");

function formatCount(value: number): string {
  return numbers.format(value);
}

/** Splits a per-type tally into one readable line: "9 Wordle · 5 Word Search". */
function splitByType(counts: Record<ActivityType, number>): string {
  return (Object.keys(TYPE_LABELS) as ActivityType[])
    .map((type) => `${formatCount(counts[type] ?? 0)} ${TYPE_LABELS[type]}`)
    .join(" · ");
}

function formatDateTime(value: string | null): string {
  return value === null ? "No events recorded yet" : new Date(value).toLocaleString("en-AU");
}

type SummaryResult =
  | { ok: true; summary: MetricsSummary }
  | { ok: false; title: string; message: string; hint?: string };

/**
 * The dashboard must still render when the API is down — a monitoring page that dies with
 * the thing it monitors is worse than useless, since the health tile is exactly what a
 * reader needs at that moment.
 */
async function loadSummary(): Promise<SummaryResult> {
  try {
    return { ok: true, summary: await getMetricsSummary() };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        ok: false,
        title: error.isUnreachable
          ? "Metrics are unavailable"
          : "The API could not return metrics",
        message: error.message,
        hint: error.isUnreachable
          ? "Start it with `docker compose up` from the repo root (or `npm run dev` in backend/), then reload this page."
          : undefined,
      };
    }

    return {
      ok: false,
      title: "Metrics are unavailable",
      message: "The dashboard figures could not be loaded.",
    };
  }
}

export default async function DashboardPage() {
  // Both are independent reads, and the health tile is most valuable precisely when the
  // metrics call is the one that failed.
  const [health, result] = await Promise.all([getApiHealth(), loadSummary()]);

  return (
    <PageShell title="Dashboard" intro={INTRO}>
      <HealthTile report={health} />

      {result.ok ? (
        <Metrics summary={result.summary} />
      ) : (
        <ApiErrorNotice
          title={result.title}
          message={result.message}
          hint={result.hint}
        />
      )}
    </PageShell>
  );
}

function Metrics({ summary }: { summary: MetricsSummary }) {
  const { activities, generations, library, events } = summary;

  return (
    <div className="flex flex-col gap-8">
      <Section id="activities" title="Activities">
        <StatCard
          label="Stored now"
          value={formatCount(activities.stored)}
          hint={splitByType(activities.storedByType)}
        />
        <StatCard
          label="Created"
          value={formatCount(activities.created)}
          hint={`${formatCount(activities.updated)} edited · ${formatCount(activities.deleted)} deleted`}
        />
        <StatCard
          label="Most-used type"
          value={
            activities.mostUsedType === null
              ? "—"
              : TYPE_LABELS[activities.mostUsedType]
          }
          hint="Ranked by puzzles generated"
        />
      </Section>

      <Section id="generation" title="Generation">
        <StatCard
          label="Succeeded"
          value={formatCount(generations.succeeded)}
          hint={splitByType(generations.byType)}
        />
        <StatCard
          label="Failed"
          value={formatCount(generations.failed)}
          hint={`${formatCount(generations.attempts)} attempts in total`}
        />
        <StatCard
          label="Success rate"
          value={generations.successRate === null ? "—" : `${generations.successRate}%`}
          hint={
            generations.averageDurationMs === null
              ? "Nothing generated yet"
              : `Average ${generations.averageDurationMs}ms per puzzle`
          }
        />
      </Section>

      <Section id="library" title="Stored library">
        <StatCard
          label="Word lists"
          value={formatCount(library.wordLists)}
          hint={
            library.emptyWordLists > 0
              ? `${formatCount(library.emptyWordLists)} hold no words`
              : "Every list holds at least one word"
          }
        />
        <StatCard label="Words" value={formatCount(library.words)} hint="Across all lists" />
        <StatCard
          label="Phonemes"
          value={formatCount(library.phonemes)}
          hint="Australian English inventory"
        />
      </Section>

      <Section id="events" title="Event log">
        <StatCard
          label="Events recorded"
          value={formatCount(events.total)}
          hint="Every figure above is derived from these"
        />
        <StatCard label="Last event" value={formatDateTime(events.lastEventAt)} />
        <StatCard
          label="Reported at"
          value={new Date(summary.generatedAt).toLocaleTimeString("en-AU")}
          hint="Refresh for current figures"
        />
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="flex flex-col gap-3">
      <h2
        id={`${id}-heading`}
        className="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        {title}
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
    </section>
  );
}
