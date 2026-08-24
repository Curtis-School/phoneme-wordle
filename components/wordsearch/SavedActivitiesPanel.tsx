"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { buildWordSearchHtml } from "@/lib/html-export/word-search-template";
import { downloadHtml } from "@/lib/html-export/download";
import { CloseIcon, DownloadIcon, ListIcon, MoonIcon, SunIcon, TrashIcon } from "@/lib/icons";
import { generateWordSearch, WORD_SEARCH_SIZE } from "@/lib/wordsearch";
import {
  deleteWordSearchActivity,
  getSavedWordSearchActivities,
  type SavedWordSearchPreview,
} from "@/lib/word-search-actions";
import type { Difficulty, Phoneme } from "@/lib/types";

const DIFFICULTY_ACCENT: Record<Difficulty, string> = {
  easy: "border-l-correct",
  medium: "border-l-present",
  hard: "border-l-absent",
};

const DIFFICULTY_LOZENGE: Record<Difficulty, string> = {
  easy: "bg-correct/10 text-correct",
  medium: "bg-present/10 text-present",
  hard: "bg-absent/10 text-absent",
};

type SavedActivitiesPanelProps = {
  /** The activity the page is currently showing, marked so it reads as the open one. */
  openId: number | null;
};

export function SavedActivitiesPanel({ openId }: SavedActivitiesPanelProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [data, setData] = useState<SavedWordSearchPreview[]>([]);
  const [inventory, setInventory] = useState<Phoneme[]>([]);
  const [error, setError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<SavedWordSearchPreview | null>(null);
  const [, startTransition] = useTransition();

  function openDialog() {
    dialogRef.current?.showModal();
    setStatus("loading");
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await getSavedWordSearchActivities();

      if (result.ok) {
        setData(result.data);
        setInventory(result.inventory);
        setStatus("ok");
      } else {
        setError(result.message);
        setStatus("error");
      }
    });
  }

  /** Loads the activity into the page, where its grid and clue list can be edited. */
  function openActivity(item: SavedWordSearchPreview) {
    dialogRef.current?.close();
    router.push(`/word-search?activity=${item.id}`);
  }

  function download(item: SavedWordSearchPreview) {
    // The saved seed reproduces the grid the activity was saved with.
    const puzzle = generateWordSearch(item.words, WORD_SEARCH_SIZE, inventory, item.seed);
    const html = buildWordSearchHtml(item.phoneme, item.words, puzzle, item.settings);

    downloadHtml(`phoneme-word-search-${item.name.replace(/\s+/g, "-").toLowerCase()}.html`, html);
  }

  function confirmDelete() {
    const item = pendingDelete;
    if (!item) return;

    setPendingDelete(null);
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await deleteWordSearchActivity(item.id);

      if (result.ok) {
        setData((current) => current.filter((entry) => entry.id !== item.id));
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <>
      <button type="button" onClick={openDialog} className={TRIGGER_CLASS}>
        <ListIcon />
        Saved activities
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,32rem)] rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Saved word search activities</h3>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <CloseIcon />
          </button>
        </div>

        {status === "loading" ? <p className="mt-4 text-sm text-muted">Loading…</p> : null}
        {status === "error" ? (
          <p role="alert" className="mt-4 text-sm text-present">
            {error}
          </p>
        ) : null}
        {status === "ok" && data.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No saved activities yet.</p>
        ) : null}

        {deleteError ? (
          <p role="alert" className="mt-4 text-xs leading-5 text-present">
            {deleteError}
          </p>
        ) : null}

        {status === "ok" && data.length > 0 ? (
          // Fixed row height (h-14) x 10 rows + gap-2 x 9 gaps between them, so the
          // scrollbar only appears once an 11th activity is saved.
          <ul className="mt-4 flex max-h-[39.5rem] flex-col gap-2 overflow-y-auto">
            {data.map((item) => (
              <li
                key={item.id}
                className={`flex h-14 shrink-0 items-center gap-2 overflow-x-auto rounded-xl border ${item.id === openId ? "border-primary" : "border-border"} ${DIFFICULTY_ACCENT[item.difficulty]} border-l-4 bg-surface-muted px-3`}
              >
                <button
                  type="button"
                  onClick={() => openActivity(item)}
                  title={`Open “${item.name}” to play and edit it`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition-opacity hover:opacity-70"
                >
                  <PhonemeTile label={item.phoneme.ipa} size="sm" />
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-muted">
                    {item.words.length} words
                  </span>
                  <span
                    className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_LOZENGE[item.difficulty]}`}
                  >
                    {item.difficulty}
                  </span>
                </button>
                <span
                  title={item.settings.theme === "dark" ? "Dark theme" : "Light theme"}
                  className="flex shrink-0 items-center justify-center text-muted"
                >
                  {item.settings.theme === "dark" ? <MoonIcon /> : <SunIcon />}
                </span>
                <button
                  type="button"
                  onClick={() => download(item)}
                  aria-label={`Download ${item.name}`}
                  title="Download playable .html"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-foreground"
                >
                  <DownloadIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  aria-label={`Delete ${item.name}`}
                  title="Delete this activity"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-present hover:text-present"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete activity"
        message={`Delete “${pendingDelete?.name}”? This can’t be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

const TRIGGER_CLASS =
  "flex h-full min-h-18 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";
