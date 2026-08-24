"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ActivitySettings, Phoneme, PhonemeWord } from "@/lib/types";
import { generateWordSearch, MAX_WORD_SEARCH_WORDS } from "@/lib/wordsearch";
import { MAX_WORD_SOUNDS } from "@/lib/wordle";
import { addWordSearchWord } from "@/lib/word-search-actions";
import { WordBuilder } from "@/components/phoneme/WordBuilder";
import { WordSearchGame } from "./WordSearchGame";
import { SaveActivityDialog } from "./SaveActivityDialog";
import { ExportButton } from "./ExportButton";

type WordSearchActivityProps = {
  phoneme: Phoneme;
  words: readonly PhonemeWord[];
  fillers: readonly Phoneme[];
  size: number;
  initialSeed: number;
  settings: ActivitySettings;
  wordListId: number | null;
  wordListWordCount: number;
  wordListActivityCount: number;
  /** Set when the page was opened from a saved activity, so edits can be written back to it. */
  activityId: number | null;
  activityName: string | null;
  /** The target-sound card and saved-activities button, which lead the toolbar row. */
  controls: ReactNode;
};

export function WordSearchActivity({
  phoneme,
  words,
  fillers,
  size,
  initialSeed,
  settings,
  wordListId,
  wordListWordCount,
  wordListActivityCount,
  activityId,
  activityName,
  controls,
}: WordSearchActivityProps) {
  const [seed, setSeed] = useState(initialSeed);
  // The clue list is edited as a draft; only saving the activity writes it back.
  const [draft, setDraft] = useState<PhonemeWord[]>([...words]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string>();

  const puzzle = useMemo(
    () => generateWordSearch(draft, size, fillers, seed),
    [draft, size, fillers, seed],
  );

  const full = draft.length >= MAX_WORD_SEARCH_WORDS;

  async function add({ english, phonemes }: { english: string; phonemes: string[] }) {
    if (draft.some((word) => word.english === english.trim().toLowerCase())) {
      return "That word is already in the list.";
    }

    const result = await addWordSearchWord({ english, phonemes, targetPhoneme: phoneme.ipa });

    if (!result.ok) return result.message;

    setDraft((current) => [...current, result.word]);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        {controls}
        <ExportButton
          phoneme={phoneme}
          words={draft}
          puzzle={puzzle}
          settings={settings}
        />
      </div>

      <WordSearchGame
        key={`${seed}:${draft.map((word) => word.english).join(",")}`}
        puzzle={puzzle}
        words={draft}
        settings={settings}
        onCycle={() => setSeed((value) => value + 1)}
        edit={{
          editing,
          onToggle: () => setEditing((open) => !open),
          onSave: () => setSaving(true),
          onRemove: (english) =>
            setDraft((current) => current.filter((word) => word.english !== english)),
          builder: full ? (
            <p className="text-xs leading-5 text-muted">
              The grid holds {MAX_WORD_SEARCH_WORDS} words. Remove one to add another.
            </p>
          ) : (
            <WordBuilder
              key={draft.length}
              inventory={fillers}
              requirement={{ kind: "contains", phoneme, maxSounds: MAX_WORD_SOUNDS }}
              display={settings.symbolDisplay}
              submitLabel="Add word"
              onSubmit={add}
              onCancel={() => setEditing(false)}
            />
          ),
        }}
      />

      <SaveActivityDialog
        open={saving}
        phoneme={phoneme}
        words={draft}
        seed={seed}
        settings={settings}
        wordListId={wordListId}
        wordListWordCount={wordListWordCount}
        wordListActivityCount={wordListActivityCount}
        activityId={activityId}
        activityName={activityName}
        onClose={() => setSaving(false)}
        onSaved={(name) => {
          setSaving(false);
          setEditing(false);
          setToast(`Saved “${name}” to your activities.`);
          setTimeout(() => setToast(undefined), 3000);
        }}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-xl border border-correct bg-correct px-4 py-3 text-sm font-semibold text-correct-foreground shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
