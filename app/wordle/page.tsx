import { PageShell } from "@/components/ui/PageShell";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import { WordleGame } from "@/components/wordle/WordleGame";
import { ExportButton } from "@/components/wordle/ExportButton";
import { loadWordle, parseActivityParam } from "@/lib/api/builder";
import { buildKeyboard } from "@/lib/wordle";
import { getActivitySettings } from "@/lib/settings-cookie";

const INTRO =
  "Guess the hidden phoneme word using sound tiles, then export the activity as a self-contained HTML file that plays offline.";

const LEGEND: { tone: "correct" | "present" | "absent"; text: string }[] = [
  { tone: "correct", text: "Right sound, right spot" },
  { tone: "present", text: "Right sound, wrong spot" },
  { tone: "absent", text: "Sound not in the word" },
];

export default async function WordlePage({ searchParams }: PageProps<"/wordle">) {
  const { activity: requested } = await searchParams;
  const result = await loadWordle(parseActivityParam(requested));
  const settings = await getActivitySettings();

  if (!result.ok) {
    return (
      <PageShell title="Phoneme Wordle" intro={INTRO}>
        <ApiErrorNotice
          title={result.title}
          message={result.message}
          hint={result.hint}
        />
      </PageShell>
    );
  }

  const { activity, config, inventory } = result.data;
  const keys = buildKeyboard(config.word, inventory);

  return (
    <PageShell title="Phoneme Wordle" intro={INTRO}>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
        <WordleGame config={config} keys={keys} settings={settings} />

        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Tile key
            </h2>
            <ul className="flex flex-col gap-2.5">
              {LEGEND.map((item) => (
                <li key={item.tone} className="flex items-center gap-3">
                  <PhonemeTile label="æ" tone={item.tone} size="sm" />
                  <span className="text-sm text-muted">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Answer key</h2>
            <p className="mt-1 mb-3 text-xs leading-5 text-muted">
              Drawn from <strong className="font-semibold">{activity.name}</strong>{" "}
              ({activity.wordList.name}). Reload for a different word.
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
              <span className="text-base font-semibold text-foreground">
                {config.englishWord}
              </span>
              <span className="ml-auto">
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
              </span>
            </div>
            <ExportButton config={config} keys={keys} settings={settings} />
          </section>
        </div>
      </div>
    </PageShell>
  );
}
