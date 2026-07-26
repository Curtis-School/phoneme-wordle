import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import { WordleBoard } from "@/components/wordle/WordleBoard";
import { getFixedWordleConfig } from "@/lib/data";

const LEGEND: { tone: "correct" | "present" | "absent"; text: string }[] = [
  { tone: "correct", text: "Right sound, right spot" },
  { tone: "present", text: "Right sound, wrong spot" },
  { tone: "absent", text: "Sound not in the word" },
];

export default function WordlePage() {
  const config = getFixedWordleConfig();

  return (
    <PagePlaceholder
      title="Phoneme Wordle"
      intro="Guess the hidden phoneme word using sound tiles."
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <WordleBoard length={config.word.length} rows={config.maxGuesses} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Tile key</h2>
          <ul className="flex flex-col gap-2">
            {LEGEND.map((item) => (
              <li key={item.tone} className="flex items-center gap-3">
                <PhonemeTile label="æ" tone={item.tone} size="sm" />
                <span className="text-sm text-muted">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-foreground">Answer key</h2>
            <p className="text-xs text-muted">
              Fixed word, only visible to the teacher building the
              activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-semibold text-foreground">
              {config.englishWord}
            </span>
            <PhonemeStrip>
              {config.word.map((phoneme, index) => (
                <PhonemeTile
                  key={index}
                  label={phoneme.label}
                  ipa={phoneme.ipa}
                  size="md"
                />
              ))}
            </PhonemeStrip>
          </div>
        </section>
      </div>
    </PagePlaceholder>
  );
}
