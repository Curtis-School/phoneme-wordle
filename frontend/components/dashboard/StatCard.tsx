import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** One line of context under the figure — what it counts, or how it is split. */
  hint?: string;
};

/**
 * One KPI figure.
 *
 * The label is rendered above the value but marked up as a `<dt>`/`<dd>` pair, so a
 * screen reader reads "Activities stored, 14" rather than two unrelated numbers.
 */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 flex flex-col gap-1">
        <span className="text-3xl font-bold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {hint ? <span className="text-xs leading-5 text-muted">{hint}</span> : null}
      </dd>
    </div>
  );
}
