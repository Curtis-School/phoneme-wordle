import { PageShell } from "@/components/ui/PageShell";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchActivity } from "@/components/wordsearch/WordSearchActivity";
import {
  getFixedWordSearchConfig,
  getFixedWordSearchWords,
  getPhonemeInventory,
} from "@/lib/data";
import { getActivitySettings } from "@/lib/settings-cookie";

export default async function WordSearchPage() {
  const config = getFixedWordSearchConfig();
  const words = getFixedWordSearchWords(5);
  const settings = await getActivitySettings();

  return (
    <PageShell
      title="Phoneme Word Search"
      intro="Find every word that features the target sound by dragging across the grid, then export a self-contained copy that plays offline."
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <span className="text-sm font-semibold text-foreground">
            Target sound
          </span>
          <PhonemeTile
            label={config.phoneme.label}
            ipa={config.phoneme.ipa}
            tone="correct"
            size="md"
          />
          <span className="text-sm text-muted">{config.phoneme.example}</span>
        </section>

        <WordSearchActivity
          phoneme={config.phoneme}
          words={words}
          fillers={getPhonemeInventory()}
          size={config.size}
          initialSeed={42}
          settings={settings}
        />
      </div>
    </PageShell>
  );
}
