"use client";

import { persistTooltips } from "@/lib/settings-actions";
import {
  SettingCard,
  usePersistedSetting,
  type SettingOption,
} from "@/components/ui/SettingCard";

const OPTIONS: readonly SettingOption<boolean>[] = [
  { value: true, label: "Show" },
  { value: false, label: "Hide" },
];

export function TooltipSetting({
  initialShowTooltips,
}: {
  initialShowTooltips: boolean;
}) {
  const { value, select, isPending } = usePersistedSetting(
    initialShowTooltips,
    persistTooltips,
  );

  return (
    <SettingCard
      title="Tooltips"
      description="Show hover hints like “F (as in fan)” on tiles and keys."
      options={OPTIONS}
      value={value}
      onSelect={select}
      disabled={isPending}
    />
  );
}
