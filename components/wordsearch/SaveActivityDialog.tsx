"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CloseIcon } from "@/lib/icons";
import { saveWordSearchActivity } from "@/lib/word-search-actions";
import type { ActivitySettings, Phoneme, PhonemeWord } from "@/lib/types";

type SaveActivityDialogProps = {
  open: boolean;
  phoneme: Phoneme;
  words: readonly PhonemeWord[];
  seed: number;
  settings: ActivitySettings;
  wordListId: number | null;
  wordListName: string | null;
  onClose: () => void;
  onSaved: (name: string) => void;
};

export function SaveActivityDialog({
  open,
  phoneme,
  words,
  seed,
  settings,
  wordListId,
  wordListName,
  onClose,
  onSaved,
}: SaveActivityDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"overwrite" | "new">("new");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await saveWordSearchActivity({
        name,
        targetPhoneme: phoneme.ipa,
        words: words.map((word) => word.english),
        seed,
        settings,
        mode,
        wordListId,
      });

      if (result.ok) {
        onSaved(name.trim());
        setName("");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Save word search activity</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <CloseIcon />
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        {words.length} {words.length === 1 ? "word" : "words"} on {phoneme.label} {phoneme.ipa}.
      </p>

      <input
        value={name}
        disabled={isPending}
        onChange={(event) => setName(event.target.value)}
        placeholder="Activity name, e.g. Week 3 sound hunt"
        className="mt-3 h-9 w-full rounded-lg border border-border bg-surface-muted px-2.5 text-sm text-foreground outline-none placeholder:text-muted focus-visible:border-primary"
      />

      <fieldset className="mt-3 flex flex-col gap-2">
        <legend className="sr-only">Where to save the words</legend>
        <label className="flex items-start gap-2 text-xs leading-5 text-foreground">
          <input
            type="radio"
            name="save-mode"
            checked={mode === "new"}
            onChange={() => setMode("new")}
            className="mt-0.5"
          />
          <span>
            Save as a new list — leaves {wordListName ?? "the current list"} untouched.
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs leading-5 text-foreground">
          <input
            type="radio"
            name="save-mode"
            checked={mode === "overwrite"}
            disabled={wordListId === null}
            onChange={() => setMode("overwrite")}
            className="mt-0.5"
          />
          <span className={wordListId === null ? "text-muted" : undefined}>
            Overwrite “{wordListName ?? "—"}” — every activity using that list changes with it.
          </span>
        </label>
      </fieldset>

      {error ? (
        <p role="alert" className="mt-3 text-xs leading-5 text-present">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-1.5">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="h-9 flex-1 rounded-lg border border-border text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending || !name.trim() || words.length === 0}
          className="h-9 flex-1 rounded-lg bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save activity"}
        </button>
      </div>
    </dialog>
  );
}
