"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/types";
import { persistTheme } from "@/lib/settings-actions";
import { MoonIcon, SunIcon } from "@/lib/icons";
import {
  SettingCard,
  usePersistedSetting,
  type SettingOption,
} from "@/components/ui/SettingCard";

const OPTIONS: readonly SettingOption<Theme>[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeSetting({ initialTheme }: { initialTheme: Theme }) {
  const { value, select, isPending } = usePersistedSetting(initialTheme, persistTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = value;
  }, [value]);

  return (
    <SettingCard
      title="Appearance"
      description="Choose a light or dark theme. Your choice is saved to a cookie and restored on your next visit."
      options={OPTIONS}
      value={value}
      onSelect={select}
      disabled={isPending}
    />
  );
}
