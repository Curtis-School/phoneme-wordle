import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { DailyChart } from "@/components/dashboard/DailyChart";
import { EVENT_KINDS, EventsTable } from "@/components/dashboard/EventsTable";
import { HealthTile } from "@/components/dashboard/HealthTile";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { PageShell } from "@/components/ui/PageShell";
import {
  ApiClientError,
  getAlerts,
  getApiHealth,
  getMetricsSummary,
  getRecentEvents,
  getTimeseries,
} from "@/lib/api/client";
import type {
  ActivityType,
  MetricsAlerts,
  MetricsSummary,
  MetricsTimeseries,
  RecentEvents,
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

async function loadAlerts(): Promise<MetricsAlerts | null> {
  try {
    return await getAlerts();
  } catch {
    return null;
  }
}

const EVENTS_PER_PAGE = 15;

async function loadEvents(page: number, kind?: string): Promise<RecentEvents | null> {
  try {
    return await getRecentEvents({
      limit: EVENTS_PER_PAGE,
      offset: (page - 1) * EVENTS_PER_PAGE,
      kind,
    });
  } catch {
    return null;
  }
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { kind, page } = await searchParams;
  const selectedKind = EVENT_KINDS.find((known) => known === kind);
  const requestedPage = Number(Array.isArray(page) ? page[0] : page);
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [health, result, timeseries, alerts, events] = await Promise.all([
    getApiHealth(),
    loadSummary(),
    loadTimeseries(),
    loadAlerts(),
    loadEvents(currentPage, selectedKind),
  ]);

  return (
    <PageShell title="Dashboard" intro={INTRO}>
      <HealthTile report={health} />

      {alerts ? <AlertsPanel data={alerts} /> : null}

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

      {events ? (
        <EventsTable
          events={events.events}
          selectedKind={selectedKind}
          page={currentPage}
          pageSize={EVENTS_PER_PAGE}
          total={events.total}
        />
      ) : null}
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
            { key: "activitiesCreated", label: "Created", tone: "succeeded" },
          ]}
        />
        <DailyChart
          id="generations-chart"
          title="Puzzles generated"
          points={timeseries.points}
          series={[
            { key: "generationsSucceeded", label: "Succeeded", tone: "succeeded" },
            { key: "generationsFailed", label: "Failed", tone: "failed" },
          ]}
        />
      </div>
      <p className="text-xs text-muted">
        Days are UTC, matching the API&apos;s own buckets.
      </p>
    </section>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;

  const seconds = Math.round(ms / 1000);

  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function Metrics({ summary }: { summary: MetricsSummary }) {
  const { activities, generations, library, engagement, events } = summary;
  const busiest = engagement.byPath[0];

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

      <Section id="engagement" title="Engagement">
        <StatCard
          label="Average time on page"
          value={formatDuration(engagement.averageTimeOnPageMs)}
          hint="Across every tracked route"
        />
        <StatCard
          label="Page views"
          value={formatCount(engagement.pageViews)}
          hint="Recorded when a visitor leaves a page"
        />
        <StatCard
          label="Busiest page"
          value={busiest ? busiest.path : "—"}
          hint={
            busiest
              ? `${formatCount(busiest.views)} views · ${formatDuration(busiest.averageMs)} average`
              : "No page views recorded yet"
          }
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
