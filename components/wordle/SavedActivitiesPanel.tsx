"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PhonemeStrip, PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { buildWordleHtml } from "@/lib/html-export/wordle-template";
import { downloadHtml } from "@/lib/html-export/download";
import {
  deleteWordleActivity,
  getSavedWordleActivities,
  saveWordleConfiguration,
  type SavedWordlePreview,
} from "@/lib/activity-actions";
import type { ActivitySettings, Difficulty } from "@/lib/types";
import type { WordleActivity } from "@/lib/api/builder";

type SavedActivitiesPanelProps = {
  summary: WordleActivity;
  wordId: number;
  englishWord: string;
  settings: ActivitySettings;
};

export function SavedActivitiesPanel({
  summary,
  wordId,
  englishWord,
  settings,
}: SavedActivitiesPanelProps) {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <SaveButton summary={summary} wordId={wordId} englishWord={englishWord} settings={settings} />
      <ViewDialog />
    </div>
  );
}

function SaveButton({ summary, wordId, englishWord, settings }: SavedActivitiesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string }>();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(undefined), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

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
        setToast({ tone: "success", message: `Saved “${englishWord}” to your activities.` });
        router.refresh();
      } else {
        setToast({ tone: "error", message: result.message });
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
        className={TRIGGER_CLASS}
      >
        <SaveIcon />
        {isPending ? "Saving…" : "Save configuration"}
      </button>

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.tone === "success"
              ? "border-correct bg-correct text-correct-foreground"
              : "border-present bg-present text-present-foreground"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </>
  );
}

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

function ViewDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [data, setData] = useState<SavedWordlePreview[]>([]);
  const [error, setError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<SavedWordlePreview | null>(null);
  const [, startTransition] = useTransition();

  function open() {
    dialogRef.current?.showModal();
    setStatus("loading");
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await getSavedWordleActivities();

      if (result.ok) {
        setData(result.data);
        setStatus("ok");
      } else {
        setError(result.message);
        setStatus("error");
      }
    });
  }

  function download(item: SavedWordlePreview) {
    const html = buildWordleHtml(item.config, item.keys, item.settings);
    downloadHtml(`phoneme-wordle-${item.config.englishWord}.html`, html);
  }

  function confirmDelete() {
    const item = pendingDelete;
    if (!item) return;

    setPendingDelete(null);
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await deleteWordleActivity(item.id);

      if (result.ok) {
        setData((current) => current.filter((entry) => entry.id !== item.id));
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <>
      <button type="button" onClick={open} className={TRIGGER_CLASS}>
        <ListIcon />
        Saved activities
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Saved Wordle activities</h3>
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
                className={`flex h-14 shrink-0 items-center gap-2 overflow-x-auto rounded-xl border border-border ${DIFFICULTY_ACCENT[item.difficulty]} border-l-4 bg-surface-muted px-3`}
              >
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {item.config.englishWord}
                </span>
                <PhonemeStrip>
                  {item.config.word.map((phoneme, index) => (
                    <PhonemeTile key={index} label={phoneme.ipa} size="sm" />
                  ))}
                </PhonemeStrip>
                <span
                  className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_LOZENGE[item.difficulty]}`}
                >
                  {item.difficulty}
                </span>
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
  "flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted";

function SaveIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}
