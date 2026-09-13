"use client";

import { useRef } from "react";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { SavedActivitiesDialog } from "@/components/ui/SavedActivitiesDialog";
import { buildWordSearchHtml } from "@/lib/html-export/word-search-template";
import { downloadHtml } from "@/lib/html-export/download";
import { generateWordSearch, WORD_SEARCH_SIZE } from "@/lib/wordsearch";
import {
  deleteWordSearchActivity,
  getSavedWordSearchActivities,
  type SavedWordSearchPreview,
} from "@/lib/word-search-actions";
import type { Phoneme } from "@/lib/types";

const TRIGGER_CLASS =
  "flex h-full min-h-18 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";

type SavedActivitiesPanelProps = {
  /** The activity the page is currently showing, marked so it reads as the open one. */
  openId: number | null;
};

export function SavedActivitiesPanel({ openId }: SavedActivitiesPanelProps) {
  // Captured on load so a download can rebuild the grid with the same filler sounds.
  const inventory = useRef<Phoneme[]>([]);

  return (
    <SavedActivitiesDialog<SavedWordSearchPreview>
      title="Saved word search activities"
      triggerClassName={TRIGGER_CLASS}
      openId={openId}
      load={async () => {
        const result = await getSavedWordSearchActivities();

        if (!result.ok) return result;

        inventory.current = result.inventory;

        return { ok: true, items: result.data };
      }}
      remove={(item) => deleteWordSearchActivity(item.id)}
      download={(item) => {
        // The saved seed reproduces the grid the activity was saved with.
        const puzzle = generateWordSearch(
          item.words,
          WORD_SEARCH_SIZE,
          inventory.current,
          item.seed,
        );

        downloadHtml(
          `phoneme-word-search-${item.name.replace(/\s+/g, "-").toLowerCase()}.html`,
          buildWordSearchHtml(item.phoneme, item.words, puzzle, item.settings),
        );
      }}
      href={(item) => `/word-search?activity=${item.id}`}
      summary={(item) => (
        <>
          <PhonemeTile label={item.phoneme.ipa} size="sm" />
          <span className="min-w-0 truncate text-sm font-semibold text-foreground">
            {item.name}
          </span>
          <span className="shrink-0 text-xs font-semibold text-muted">
            {item.words.length} words
          </span>
        </>
      )}
    />
  );
}
