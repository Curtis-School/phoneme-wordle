import type { TimeseriesPoint } from "@/lib/api/types";

export type ChartSeries = {
  key: keyof Omit<TimeseriesPoint, "date">;
  label: string;
  color: string;
};

type DailyChartProps = {
  id: string;
  title: string;
  points: TimeseriesPoint[];
  series: ChartSeries[];
};

const WIDTH = 760;
const HEIGHT = 200;
const PAD = { top: 16, right: 8, bottom: 26, left: 34 };
const BAR_GAP = 2;

const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function DailyChart({ id, title, points, series }: DailyChartProps) {
  const max = Math.max(
    1,
    ...points.flatMap((point) => series.map((item) => point[item.key])),
  );
  const slot = PLOT_W / Math.max(points.length, 1);
  const barWidth = Math.max(
    2,
    (slot - BAR_GAP * 2 - BAR_GAP * (series.length - 1)) / series.length,
  );
  const total = (key: ChartSeries["key"]) =>
    points.reduce((sum, point) => sum + point[key], 0);

  const y = (value: number) => PAD.top + PLOT_H * (1 - value / max);

  return (
    <figure
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-foreground">
          {title}
        </h3>
        <span className="text-xs text-muted">
          {points.length} days to {shortDate(points[points.length - 1]?.date ?? "")}
        </span>
      </figcaption>

      <ul className="flex flex-wrap items-center gap-4">
        {series.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            {item.label}
            <span className="font-semibold text-foreground">{total(item.key)}</span>
          </li>
        ))}
      </ul>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${id}-title`}
        className="h-auto w-full"
      >
        {[0, 0.5, 1].map((fraction) => (
          <line
            key={fraction}
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(max * fraction)}
            y2={y(max * fraction)}
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}

        <text x={0} y={y(max) + 4} fill="var(--muted)" fontSize={11}>
          {max}
        </text>
        <text x={0} y={y(0) + 4} fill="var(--muted)" fontSize={11}>
          0
        </text>

        {points.map((point, index) =>
          series.map((item, seriesIndex) => {
            const value = point[item.key];

            if (value === 0) return null;

            const x =
              PAD.left +
              index * slot +
              BAR_GAP +
              seriesIndex * (barWidth + BAR_GAP);
            const height = Math.max(2, PLOT_H * (value / max));

            return (
              <rect
                key={`${point.date}-${item.key}`}
                x={x}
                y={PAD.top + PLOT_H - height}
                width={barWidth}
                height={height}
                rx={2}
                fill={item.color}
              >
                <title>{`${shortDate(point.date)}: ${value} ${item.label.toLowerCase()}`}</title>
              </rect>
            );
          }),
        )}

        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />

        {points.length > 0 ? (
          <>
            <text x={PAD.left} y={HEIGHT - 8} fill="var(--muted)" fontSize={11}>
              {shortDate(points[0].date)}
            </text>
            <text
              x={WIDTH - PAD.right}
              y={HEIGHT - 8}
              textAnchor="end"
              fill="var(--muted)"
              fontSize={11}
            >
              {shortDate(points[points.length - 1].date)}
            </text>
          </>
        ) : null}
      </svg>

      <details>
        <summary className="cursor-pointer text-xs font-semibold text-muted">
          Show these figures as a table
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <caption className="sr-only">{title}, by day.</caption>
            <thead>
              <tr className="text-muted">
                <th scope="col" className="px-2 py-1.5 font-semibold">Date</th>
                {series.map((item) => (
                  <th key={item.key} scope="col" className="px-2 py-1.5 font-semibold">
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date} className="border-t border-border">
                  <th scope="row" className="px-2 py-1.5 font-medium text-muted">
                    {shortDate(point.date)}
                  </th>
                  {series.map((item) => (
                    <td key={item.key} className="px-2 py-1.5 text-foreground">
                      {point[item.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
