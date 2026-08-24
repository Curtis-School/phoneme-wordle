import { PageShell } from "@/components/ui/PageShell";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { WordSearchActivity } from "@/components/wordsearch/WordSearchActivity";
import { TargetSoundControls } from "@/components/wordsearch/TargetSoundControls";
import { loadWordSearch, parsePhonemeParam } from "@/lib/api/builder/word-search";
import { getActivitySettings } from "@/lib/settings-cookie";

const INTRO =
  "Find every word that features the target sound by dragging across the grid, then export a self-contained copy that plays offline.";

export default async function WordSearchPage({
  searchParams,
}: PageProps<"/word-search">) {
  const { phoneme: requested } = await searchParams;
  const result = await loadWordSearch({ phoneme: parsePhonemeParam(requested) });

  const settings = await getActivitySettings();

  if (!result.ok) {
    return (
      <PageShell title="Phoneme Word Search" intro={INTRO}>
        <ApiErrorNotice
          title={result.title}
          message={result.message}
          hint={result.hint}
        />
      </PageShell>
    );
  }

  const { phoneme, words, inventory, options, size, seed } = result.data;

  return (
    <PageShell
      title="Phoneme Word Search"
      intro={INTRO}
      aside={
        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface py-3 pl-3.5 pr-3.5">
          <span className="flex size-12 flex-col items-center justify-center rounded-xl bg-primary leading-none text-on-primary">
            <span className="text-base font-bold">{phoneme.label}</span>
            <span className="mt-0.5 text-[0.625rem] opacity-85">
              {phoneme.ipa}
            </span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted">
              Target sound
            </span>
            <span className="text-sm font-semibold text-foreground">
              {phoneme.example}
            </span>
          </span>
          <span className="ml-auto">
            <TargetSoundControls current={phoneme.ipa} options={options} />
          </span>
        </div>
      }
    >
      {words.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold text-foreground">
            No words saved for {phoneme.label} {phoneme.ipa} yet
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-muted">
            This sound has no word list to build a puzzle from. Use the reload
            icon to draw a sound that is ready to play.
          </p>
        </section>
      ) : (
        <WordSearchActivity
          key={phoneme.ipa}
          phoneme={phoneme}
          words={words}
          fillers={inventory}
          size={size}
          initialSeed={seed}
          settings={settings}
        />
      )}
    </PageShell>
  );
}
