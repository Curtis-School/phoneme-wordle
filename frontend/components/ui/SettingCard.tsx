"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { SVGProps } from "react";

export type SettingOption<T> = {
  value: T;
  label: string;
  icon?: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

type SettingCardProps<T> = {
  title: string;
  description: ReactNode;
  options: readonly SettingOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
};

export function SettingCard<T extends string | boolean>({
  title,
  description,
  options,
  value,
  onSelect,
  disabled = false,
}: SettingCardProps<T>) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <div
        role="radiogroup"
        aria-label={title}
        className="inline-flex w-full max-w-xs gap-1 rounded-xl border border-border bg-surface-muted p-1"
      >
        {options.map((option) => {
          const active = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onSelect(option.value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-primary text-on-primary" : "text-foreground hover:bg-surface"
              }`}
            >
              {Icon ? <Icon width={18} height={18} strokeWidth={2} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function usePersistedSetting<T>(initial: T, persist: (value: T) => Promise<void>) {
  const [value, setValue] = useState<T>(initial);
  const [isPending, startTransition] = useTransition();

  function select(next: T) {
    if (next === value) return;
    setValue(next);
    startTransition(() => {
      persist(next);
    });
  }

  return { value, select, isPending };
}
