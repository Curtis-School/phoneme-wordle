import { AlertCircleIcon, CheckIcon } from "@/lib/icons";
import type { ApiHealthReport } from "@/lib/api/types";

/**
 * Live health of the API the dashboard reads from.
 *
 * Status is carried by an icon and a word as well as colour, so it survives both a
 * greyscale print and a colour-vision deficiency — the same rule the alerts panel follows.
 */

type Presentation = {
  label: string;
  detail: string;
  healthy: boolean;
};

function present(report: ApiHealthReport): Presentation {
  if (report.status === "unreachable") {
    return { label: "Unreachable", detail: report.message, healthy: false };
  }

  if (report.status === "error" || report.health.database !== "connected") {
    return {
      label: "Degraded",
      detail: "The API answered but cannot reach its database, so nothing can be saved.",
      healthy: false,
    };
  }

  return {
    label: "Healthy",
    detail: `Database connected · API up for ${formatUptime(report.health.uptime)}`,
    healthy: true,
  };
}

/** Seconds as "45s", "12m 05s" or "3h 07m" — whichever is readable at that scale. */
function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;

  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function HealthTile({ report }: { report: ApiHealthReport }) {
  const { label, detail, healthy } = present(report);

  return (
    <section
      aria-labelledby="health-heading"
      // A failing check is an alert; a passing one is just status, and announcing it on
      // every load would be noise.
      role={healthy ? undefined : "alert"}
      className={`flex items-start gap-4 rounded-2xl border p-5 ${
        healthy ? "border-border bg-surface" : "border-present bg-surface"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          healthy
            ? "bg-correct text-correct-foreground"
            : "bg-present text-present-foreground"
        }`}
      >
        {healthy ? <CheckIcon /> : <AlertCircleIcon />}
      </span>

      <div className="flex flex-col gap-1">
        <h2
          id="health-heading"
          className="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Activity API
        </h2>
        <p className="text-lg font-semibold leading-tight text-foreground">{label}</p>
        <p className="max-w-prose text-sm leading-6 text-muted">{detail}</p>
        <p className="text-xs text-muted">Checked in {report.latencyMs}ms</p>
      </div>
    </section>
  );
}
