import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { WordSearchGrid } from "@/components/wordsearch/WordSearchGrid";
import { WordSearchClues } from "@/components/wordsearch/WordSearchClues";
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
      intro="Find every word that features the target sound."
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
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Answer key — target words highlighted
            </h2>
            <div className="overflow-x-auto">
              <WordSearchGrid puzzle={puzzle} showSolution />
            </div>
          </section>

          <section className="flex flex-col gap-3 lg:min-w-72">
            <h2 className="text-sm font-semibold text-foreground">
              Words to find
            </h2>
            <WordSearchClues words={words} />
          </section>
        </div>
      </div>
    </PagePlaceholder>
  );
}
