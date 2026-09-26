import Link from "next/link";
import type { RecentEvent } from "@/lib/api/types";

const KIND_LABELS: Record<string, string> = {
  activity_created: "Activity created",
  activity_updated: "Activity edited",
  activity_deleted: "Activity deleted",
  generation_succeeded: "Puzzle generated",
  generation_failed: "Generation failed",
  word_list_created: "Word list created",
  word_list_updated: "Word list edited",
  word_list_deleted: "Word list deleted",
  export: "Exported",
};

export const EVENT_KINDS = Object.keys(KIND_LABELS);

function describe(event: RecentEvent): string {
  const parts: string[] = [];

  if (event.errorCode) parts.push(event.errorCode);
  if (event.difficulty) parts.push(event.difficulty);
  if (event.durationMs !== null) parts.push(`${event.durationMs}ms`);
  if (event.wordListName) parts.push(event.wordListName);

  return parts.length > 0 ? parts.join(" · ") : "—";
}

function pageHref(page: number, kind?: string): string {
  const params = new URLSearchParams();

  if (kind) params.set("kind", kind);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return `/dashboard${query ? `?${query}` : ""}#events-table-heading`;
}

export function EventsTable({
  events,
  selectedKind,
  page,
  pageSize,
  total,
}: {
  events: RecentEvent[];
  selectedKind?: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  return (
    <section aria-labelledby="events-table-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          id="events-table-heading"
          // Cleared by the sticky header when jumped to via the fragment.
          className="scroll-mt-20 text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Recent events
        </h2>

        {/* A plain GET form: filtering keeps working without client JavaScript. A GET
            submit rewrites only the query, so the fragment holds the scroll position. */}
        <form
          method="get"
          action="/dashboard#events-table-heading"
          className="flex items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Filter by event
            <select
              name="kind"
              defaultValue={selectedKind ?? ""}
              className="h-9 rounded-lg border border-border bg-surface-muted px-2.5 text-sm text-foreground"
            >
              <option value="">All events</option>
              {EVENT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="h-9 rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Apply
          </button>
        </form>
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-6 text-sm text-muted">
          No events match this filter yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              The most recent events recorded by the API, newest first.
            </caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">When</th>
                <th scope="col" className="px-4 py-3 font-semibold">Event</th>
                <th scope="col" className="px-4 py-3 font-semibold">Activity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(event.createdAt).toLocaleString("en-AU")}
                  </td>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    {KIND_LABELS[event.kind] ?? event.kind}
                  </th>
                  <td className="px-4 py-3 text-muted">
                    {event.activityName ??
                      (event.activityId === null
                        ? "—"
                        : `Deleted activity #${event.activityId}`)}
                  </td>
                  <td className="px-4 py-3 text-muted">{describe(event)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 ? (
        <nav
          aria-label="Event pages"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p aria-live="polite" className="text-xs text-muted">
            Showing {firstShown}–{lastShown} of {total}
          </p>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1, selectedKind)} className={PAGE_LINK}>
                Previous
              </Link>
            ) : (
              <span className={PAGE_LINK_DISABLED} aria-disabled="true">
                Previous
              </span>
            )}

            <span className="text-xs text-muted">
              Page {page} of {lastPage}
            </span>

            {page < lastPage ? (
              <Link href={pageHref(page + 1, selectedKind)} className={PAGE_LINK}>
                Next
              </Link>
            ) : (
              <span className={PAGE_LINK_DISABLED} aria-disabled="true">
                Next
              </span>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}

const PAGE_LINK =
  "inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";

const PAGE_LINK_DISABLED =
  "inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-semibold text-muted opacity-50";
