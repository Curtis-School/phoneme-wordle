"use client";

import { useTransition } from "react";
import { PhonemeStrip, PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { SavedActivitiesDialog } from "@/components/ui/SavedActivitiesDialog";
import { ToastMessage, useToast } from "@/components/ui/Toast";
import { buildWordleHtml } from "@/lib/html-export/wordle-template";
import { downloadHtml } from "@/lib/html-export/download";
import { SaveIcon } from "@/lib/icons";
import {
  deleteWordleActivity,
  getSavedWordleActivities,
  saveWordleConfiguration,
  type SavedWordlePreview,
} from "@/lib/activity-actions";
import type { ActivitySettings } from "@/lib/types";
import type { WordleActivity } from "@/lib/api/builder/wordle";

const TRIGGER_CLASS =
  "flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";

/** Saving is the main thing a teacher does on this page, so it carries the fill. */
const SAVE_CLASS =
  "flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60";

type SavedActivitiesPanelProps = {
  summary: WordleActivity;
  wordId: number;
  englishWord: string;
  settings: ActivitySettings;
};

export function SavedActivitiesPanel(props: SavedActivitiesPanelProps) {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <SaveButton {...props} />
      <SavedActivitiesDialog<SavedWordlePreview>
        title="Saved Wordle activities"
        triggerClassName={TRIGGER_CLASS}
        width="xl"
        openId={props.summary.id}
        load={async () => {
          const result = await getSavedWordleActivities();

          return result.ok ? { ok: true, items: result.data } : result;
        }}
        remove={(item) => deleteWordleActivity(item.id)}
        download={(item) => {
          if (!item.pinned) return;

          downloadHtml(
            `phoneme-wordle-${item.pinned.config.englishWord}.html`,
            buildWordleHtml(item.pinned.config, item.pinned.keys, item.settings),
          );
        }}
        downloadBlocked={(item) =>
          item.pinned
            ? undefined
            : "No word is pinned — open it to draw one, then export."
        }
        href={(item) => `/wordle?activity=${item.id}`}
        summary={(item) => (
          <>
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">
              {item.pinned ? item.pinned.config.englishWord : item.name}
            </span>
            {item.pinned ? (
              <PhonemeStrip nowrap>
                {item.pinned.config.word.map((phoneme, index) => (
                  <PhonemeTile key={index} label={phoneme.ipa} size="sm" />
                ))}
              </PhonemeStrip>
            ) : (
              // No pinned word means there is nothing fixed to show: this activity draws a
              // fresh word of the right length each time it is opened.
              <span className="shrink-0 text-xs text-muted">
                Any {item.wordLength}-sound word
              </span>
            )}
          </>
        )}
      />
    </div>
  );
}

function SaveButton({ summary, wordId, englishWord, settings }: SavedActivitiesPanelProps) {
  const [isPending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function save() {
    startTransition(async () => {
      const result = await saveWordleConfiguration({
        englishWord,
        difficulty: summary.difficulty,
        wordListId: summary.wordList.id,
        wordLength: summary.wordLength,
        wordId,
        settings,
      });

      if (result.ok) {
        show("success", `Saved “${englishWord}” to your activities.`);
      } else {
        show("error", result.message);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={save}
        disabled={isPending}
        title={`Save “${englishWord}” at ${summary.difficulty} difficulty`}
        className={SAVE_CLASS}
      >
        <SaveIcon />
        {isPending ? "Saving…" : "Save activity"}
      </button>

      <ToastMessage toast={toast} />
    </>
  );
}
