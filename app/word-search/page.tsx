import { PageShell } from "@/components/ui/PageShell";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { WordSearchActivity } from "@/components/wordsearch/WordSearchActivity";
import { loadWordSearch, parseActivityParam } from "@/lib/api/builder";
import { getActivitySettings } from "@/lib/settings-cookie";

const INTRO =
  "Find every word that features the target sound by dragging across the grid, then export a self-contained copy that plays offline.";

export default async function WordSearchPage({
  searchParams,
}: PageProps<"/word-search">) {
  const { activity: requested } = await searchParams;
  const result = await loadWordSearch(parseActivityParam(requested));

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

  const { config, inventory, seed } = result.data;

  return (
    <PageShell
      title="Phoneme Word Search"
      intro={INTRO}
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
        words={config.words}
        fillers={inventory}
        size={config.size}
        initialSeed={seed}
        settings={settings}
      />
    </PageShell>
  );
}
