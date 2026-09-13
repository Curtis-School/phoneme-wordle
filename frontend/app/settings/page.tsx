import { PageShell } from "@/components/ui/PageShell";
import { ThemeSetting } from "@/components/settings/ThemeSetting";
import { SymbolDisplaySetting } from "@/components/settings/SymbolDisplaySetting";
import { TooltipSetting } from "@/components/settings/TooltipSetting";
import { getActivitySettings } from "@/lib/settings-cookie";

export default async function SettingsPage() {
  const settings = await getActivitySettings();

  return (
    <PageShell
      title="Settings"
      intro="Manage how the activity builder looks and behaves. These preferences apply to the live activities and the HTML files you export."
    >
      <div className="flex flex-col gap-4">
        <ThemeSetting initialTheme={settings.theme} />
        <SymbolDisplaySetting initialDisplay={settings.symbolDisplay} />
        <TooltipSetting initialShowTooltips={settings.showTooltips} />
      </div>
    </PageShell>
  );
}
