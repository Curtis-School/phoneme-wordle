import { PageShell } from "@/components/ui/PageShell";
import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import { WordleGame } from "@/components/wordle/WordleGame";
import { ExportButton } from "@/components/wordle/ExportButton";
import { getFixedWordleConfig, getPhonemeInventory } from "@/lib/data";
import { buildKeyboard } from "@/lib/wordle";
import { getActivitySettings } from "@/lib/settings-cookie";

const LEGEND: { tone: "correct" | "present" | "absent"; text: string }[] = [
  { tone: "correct", text: "Right sound, right spot" },
  { tone: "present", text: "Right sound, wrong spot" },
  { tone: "absent", text: "Sound not in the word" },
];

export default async function WordlePage() {
  const config = getFixedWordleConfig();
  const keys = buildKeyboard(config.word, getPhonemeInventory());
  const settings = await getActivitySettings();

  return (
    <PageShell
      title="Phoneme Wordle"
      intro="Guess the hidden phoneme word using sound tiles, then export the activity as a self-contained HTML file that plays offline."
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
        <WordleGame config={config} keys={keys} settings={settings} />

        <div className="flex flex-col gap-6 sm:w-64">
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

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold text-foreground">
                Answer key
              </h2>
              <p className="text-xs text-muted">
                Fixed word, only visible to the teacher building the activity.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-foreground">
                {config.englishWord}
              </span>
              <PhonemeStrip>
                {config.word.map((phoneme, index) => (
                  <PhonemeTile
                    key={index}
                    label={phoneme.ipa}
                    reveal={phoneme.english}
                    size="sm"
                  />
                ))}
              </PhonemeStrip>
            </div>
            <ExportButton config={config} keys={keys} settings={settings} />
          </section>
        </div>
      </div>
    </PageShell>
  );
}
