import { PageShell } from "@/components/ui/PageShell";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { WordSearchActivity } from "@/components/wordsearch/WordSearchActivity";
import { TargetSoundControls } from "@/components/wordsearch/TargetSoundControls";
import { SavedActivitiesPanel } from "@/components/wordsearch/SavedActivitiesPanel";
import { parseActivityParam } from "@/lib/api/builder/shared";
import {
  loadWordSearch,
  parsePhonemeParam,
} from "@/lib/api/builder/word-search";
import { getActivitySettings } from "@/lib/settings-cookie";

const INTRO =
  "Find every word that features the target sound by dragging across the grid, then export a self-contained copy that plays offline.";

export default async function WordSearchPage({
  searchParams,
}: PageProps<"/word-search">) {
  const { activity, phoneme: requested } = await searchParams;
  const result = await loadWordSearch({
    activity: parseActivityParam(activity),
    phoneme: parsePhonemeParam(requested),
  });

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

  const {
    phoneme,
    words,
    inventory,
    options,
    size,
    seed,
    wordListId,
    wordListWordCount,
    wordListActivityCount,
    activityId,
    activityName,
  } = result.data;

  // The first two cells of the toolbar row; the activity adds the export card after them.
  const controls = (
    <>
      <div className="flex min-h-18 items-center gap-3.5 rounded-2xl border border-border bg-surface px-3.5 py-3">
        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary leading-none text-on-primary">
          <span className="text-base font-bold">{phoneme.label}</span>
          <span className="mt-0.5 text-[0.625rem] opacity-85">
            {phoneme.ipa}
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted">
            Target sound
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {phoneme.example}
          </span>
        </span>
        <span className="ml-auto">
          <TargetSoundControls current={phoneme.ipa} options={options} />
        </span>
      </div>
      <SavedActivitiesPanel openId={activityId} />
    </>
  );

  return (
    <PageShell title="Phoneme Word Search" intro={INTRO}>
      {words.length === 0 ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">{controls}</div>
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold text-foreground">
              No words saved for {phoneme.label} {phoneme.ipa} yet
            </h2>
            <p className="mt-1.5 text-xs leading-6 text-muted">
              This sound has no word list to build a puzzle from. Use the reload
              icon to draw a sound that is ready to play.
            </p>
          </section>
        </>
      ) : (
        <WordSearchActivity
          key={activityId ?? phoneme.ipa}
          phoneme={phoneme}
          words={words}
          fillers={inventory}
          size={size}
          initialSeed={seed}
          settings={settings}
          wordListId={wordListId}
          wordListWordCount={wordListWordCount}
          wordListActivityCount={wordListActivityCount}
          activityId={activityId}
          activityName={activityName}
          controls={controls}
        />
      )}
    </PageShell>
  );
}
