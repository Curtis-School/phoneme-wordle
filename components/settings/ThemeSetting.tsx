"use client";

import { useEffect, useState, useTransition } from "react";
import type { Theme } from "@/lib/types";
import { persistTheme } from "@/lib/settings-actions";

type ThemeSettingProps = {
  initialTheme: Theme;
};

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeSetting({ initialTheme }: ThemeSettingProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function select(next: Theme) {
    if (next === theme) return;
    setTheme(next);
    startTransition(() => {
      persistTheme(next);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted">
          Choose a light or dark theme. Your choice is saved to a cookie and
          restored on your next visit.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Theme"
        className="inline-flex w-full max-w-xs gap-1 rounded-xl border border-border bg-surface-muted p-1"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
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
              <Icon />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
