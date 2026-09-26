import { AlertCircleIcon, CheckIcon } from "@/lib/icons";
import type { AlertSeverity, MetricsAlerts } from "@/lib/api/types";

const SEVERITY: Record<AlertSeverity, { label: string; className: string }> = {
  error: { label: "Error", className: "border-present text-present" },
  warning: { label: "Warning", className: "border-border-strong text-muted" },
};

export function AlertsPanel({ data }: { data: MetricsAlerts }) {
  const { alerts, counts } = data;

  return (
    <section aria-labelledby="alerts-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="alerts-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Alerts
        </h2>
        <p className="text-xs text-muted">
          {counts.error} errors · {counts.warning} warnings
        </p>
      </div>

      {alerts.length === 0 ? (
        <p className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-correct text-correct-foreground"
          >
            <CheckIcon />
          </span>
          Nothing needs attention: every stored activity can be generated and no
          generation has failed in the last hour.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const severity = SEVERITY[alert.severity];

            return (
              <li
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 ${severity.className}`}
              >
                <span aria-hidden="true" className="mt-0.5">
                  <AlertCircleIcon width={18} height={18} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    <span className="uppercase tracking-wide">{severity.label}</span>
                    {" — "}
                    {alert.title}
                  </span>
                  <span className="text-sm leading-6 text-muted">{alert.message}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
