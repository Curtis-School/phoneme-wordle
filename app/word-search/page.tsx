import { PageShell } from "@/components/ui/PageShell";
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
      aside={
        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface py-3 pl-3.5 pr-4.5">
          <span className="flex size-12 flex-col items-center justify-center rounded-xl bg-primary leading-none text-on-primary">
            <span className="text-base font-bold">{config.phoneme.label}</span>
            <span className="mt-0.5 text-[0.625rem] opacity-85">
              {config.phoneme.ipa}
            </span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted">
              Target sound
            </span>
            <span className="text-sm font-semibold text-foreground">
              {config.phoneme.example}
            </span>
          </span>
        </div>
      }
    >
      <WordSearchActivity
        phoneme={config.phoneme}
        words={words}
        fillers={getPhonemeInventory()}
        size={config.size}
        initialSeed={42}
        settings={settings}
      />
    </PageShell>
  );
}
