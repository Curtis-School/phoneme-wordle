"use client";

import { useEffect, useState, useTransition } from "react";
import type { Theme } from "@/lib/types";
import { persistTheme } from "@/lib/settings-actions";
import { MoonIcon, SunIcon } from "@/lib/icons";

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
              <Icon width={18} height={18} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

