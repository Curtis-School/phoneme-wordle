import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchGame } from "@/components/wordsearch/WordSearchGame";
import { ExportButton } from "@/components/wordsearch/ExportButton";
import {
  getFixedWordSearchConfig,
  getFixedWordSearchWords,
  getPhonemeInventory,
} from "@/lib/data";
import { generateWordSearch } from "@/lib/wordsearch";

export default function WordSearchPage() {
  const config = getFixedWordSearchConfig();
  const words = getFixedWordSearchWords(5);
  const puzzle = generateWordSearch(
    words,
    config.size,
    getPhonemeInventory(),
    42,
  );

  return (
    <PagePlaceholder
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

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <WordSearchGame puzzle={puzzle} words={words} />

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 lg:w-72">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold text-foreground">
                Take-home copy
              </h2>
              <p className="text-xs text-muted">
                Download a self-contained HTML word search that plays offline.
              </p>
            </div>
            <ExportButton
              phoneme={config.phoneme}
              words={words}
              puzzle={puzzle}
            />
          </section>
        </div>
      </div>
    </PagePlaceholder>
  );
}
