"use client";

import type { SymbolDisplay } from "@/lib/types";
import { persistSymbolDisplay } from "@/lib/settings-actions";
import {
  SettingCard,
  usePersistedSetting,
  type SettingOption,
} from "@/components/ui/SettingCard";

const OPTIONS: readonly SettingOption<SymbolDisplay>[] = [
  { value: "ipa", label: "IPA symbol" },
  { value: "english", label: "English letter" },
];

export function SymbolDisplaySetting({
  initialDisplay,
}: {
  initialDisplay: SymbolDisplay;
}) {
  const { value, select, isPending } = usePersistedSetting(
    initialDisplay,
    persistSymbolDisplay,
  );

  return (
    <SettingCard
      title="Default tile display"
      description="Choose which symbol tiles show at rest. The other symbol still appears on hover."
      options={OPTIONS}
      value={value}
      onSelect={select}
      disabled={isPending}
    />
  );
}
