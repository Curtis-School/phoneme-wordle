import { DailyChart } from "@/components/dashboard/DailyChart";
import { HealthTile } from "@/components/dashboard/HealthTile";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { PageShell } from "@/components/ui/PageShell";
import {
  ApiClientError,
  getApiHealth,
  getMetricsSummary,
  getTimeseries,
} from "@/lib/api/client";
import type {
  ActivityType,
  MetricsSummary,
  MetricsTimeseries,
} from "@/lib/api/types";

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

async function loadTimeseries(): Promise<MetricsTimeseries | null> {
  try {
    return await getTimeseries(30);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const [health, result, timeseries] = await Promise.all([
    getApiHealth(),
    loadSummary(),
    loadTimeseries(),
  ]);

  return (
    <PageShell title="Dashboard" intro={INTRO}>
      <HealthTile report={health} />

      {timeseries ? <Charts timeseries={timeseries} /> : null}

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

function Charts({ timeseries }: { timeseries: MetricsTimeseries }) {
  return (
    <section aria-labelledby="trends-heading" className="flex flex-col gap-3">
      <h2
        id="trends-heading"
        className="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        Daily trend
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <DailyChart
          id="activities-chart"
          title="Activities created"
          points={timeseries.points}
          series={[
            {
              key: "activitiesCreated",
              label: "Created",
              color: "var(--chart-succeeded)",
            },
          ]}
        />
        <DailyChart
          id="generations-chart"
          title="Puzzles generated"
          points={timeseries.points}
          series={[
            {
              key: "generationsSucceeded",
              label: "Succeeded",
              color: "var(--chart-succeeded)",
            },
            { key: "generationsFailed", label: "Failed", color: "var(--chart-failed)" },
          ]}
        />
      </div>
      <p className="text-xs text-muted">
        Days are UTC, matching the API&apos;s own buckets.
      </p>
    </section>
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
