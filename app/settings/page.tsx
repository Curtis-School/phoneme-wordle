import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { ThemeSetting } from "@/components/settings/ThemeSetting";
import { getTheme } from "@/lib/theme-cookie";

export default async function SettingsPage() {
  const theme = await getTheme();

  return (
    <PagePlaceholder
      title="Settings"
      intro="Manage how the activity builder looks and behaves. More layout preferences will live here."
    >
      <ThemeSetting initialTheme={theme} />
    </PagePlaceholder>
  );
}
