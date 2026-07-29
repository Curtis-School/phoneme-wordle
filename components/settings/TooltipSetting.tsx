"use client";

import { useState, useTransition } from "react";
import { persistTooltips } from "@/lib/settings-actions";

type TooltipSettingProps = {
  initialShowTooltips: boolean;
};

const OPTIONS: { value: boolean; label: string }[] = [
  { value: true, label: "Show" },
  { value: false, label: "Hide" },
];

export function TooltipSetting({ initialShowTooltips }: TooltipSettingProps) {
  const [show, setShow] = useState<boolean>(initialShowTooltips);
  const [isPending, startTransition] = useTransition();

  function select(next: boolean) {
    if (next === show) return;
    setShow(next);
    startTransition(() => {
      persistTooltips(next);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Tooltips</h2>
        <p className="text-sm text-muted">
          Show hover hints like &ldquo;F (as in fan)&rdquo; on tiles and keys.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Tooltips"
        className="inline-flex w-full max-w-xs gap-1 rounded-xl border border-border bg-surface-muted p-1"
      >
        {OPTIONS.map(({ value, label }) => {
          const active = show === value;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isPending}
              onClick={() => select(value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
