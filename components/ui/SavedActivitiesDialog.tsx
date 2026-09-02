"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal, type ModalWidth } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { DownloadIcon, ListIcon, MoonIcon, SunIcon, TrashIcon } from "@/lib/icons";
import { DIFFICULTY_ACCENT, DIFFICULTY_LOZENGE } from "@/lib/difficulty";
import { ERROR_TEXT, ROW_ICON_BUTTON, ROW_ICON_BUTTON_DANGER } from "@/lib/ui";
import type { ActionResult, ActivitySettings, Difficulty } from "@/lib/types";

/** The shape every saved-activity preview shares, whatever activity it describes. */
export type SavedActivity = {
  id: number;
  name: string;
  difficulty: Difficulty;
  settings: ActivitySettings;
};

type LoadResult<T> = { ok: true; items: T[] } | { ok: false; message: string };

type SavedActivitiesDialogProps<T extends SavedActivity> = {
  title: string;
  triggerClassName: string;
  width?: ModalWidth;
  /** The activity the page is currently showing, marked so it reads as the open one. */
  openId: number | null;
  load: () => Promise<LoadResult<T>>;
  remove: (item: T) => Promise<ActionResult>;
  download: (item: T) => void;
  /** Why a row cannot be exported yet, if it cannot. Undefined means it can. */
  downloadBlocked?: (item: T) => string | undefined;
  /** Where opening a row navigates to, so its activity loads into the page. */
  href: (item: T) => string;
  /** The row's own summary — the part that differs between activity types. */
  summary: (item: T) => ReactNode;
};

export function SavedActivitiesDialog<T extends SavedActivity>({
  title,
  triggerClassName,
  width = "lg",
  openId,
  load,
  remove,
  download,
  downloadBlocked,
  href,
  summary,
}: SavedActivitiesDialogProps<T>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [, startTransition] = useTransition();

  function openDialog() {
    setOpen(true);
    setStatus("loading");
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await load();

      if (result.ok) {
        setItems(result.items);
        setStatus("ok");
      } else {
        setError(result.message);
        setStatus("error");
      }
    });
  }

  function openActivity(item: T) {
    setOpen(false);
    router.push(href(item));
  }

  function confirmDelete() {
    const item = pendingDelete;
    if (!item) return;

    setPendingDelete(null);
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await remove(item);

      if (result.ok) {
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <>
      <button type="button" onClick={openDialog} className={triggerClassName}>
        <ListIcon />
        Saved activities
      </button>

      <Modal open={open} title={title} width={width} onClose={() => setOpen(false)}>
        {status === "loading" ? <p className="mt-4 text-sm text-muted">Loading…</p> : null}
        {status === "error" ? (
          <p role="alert" className="mt-4 text-sm text-present">
            {error}
          </p>
        ) : null}
        {status === "ok" && items.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No saved activities yet.</p>
        ) : null}

        {deleteError ? (
          <p role="alert" className={`mt-4 ${ERROR_TEXT}`}>
            {deleteError}
          </p>
        ) : null}

        {status === "ok" && items.length > 0 ? (
          // Fixed row height (h-14) x 10 rows + gap-2 x 9 gaps between them, so the
          // scrollbar only appears once an 11th activity is saved. Rows are taller on
          // mobile, where the viewport caps the list first.
          <ul className="mt-4 flex max-h-[min(60vh,39.5rem)] flex-col gap-2 overflow-y-auto">
            {items.map((item) => {
              const blocked = downloadBlocked?.(item);

              return (
                <li
                  key={item.id}
                  // Below sm the summary takes a line of its own and the controls drop
                  // beneath it; from sm up the row is the original single line.
                  className={`flex min-h-14 shrink-0 flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border py-2 ${item.id === openId ? "border-primary" : "border-border"} ${DIFFICULTY_ACCENT[item.difficulty]} border-l-4 bg-surface-muted px-3 sm:h-14 sm:flex-nowrap sm:py-0`}
                >
                  <button
                    type="button"
                    onClick={() => openActivity(item)}
                    title={`Open “${item.name}” to play and edit it`}
                    className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg text-left transition-opacity hover:opacity-70 sm:w-auto sm:flex-1"
                  >
                    {summary(item)}
                    <span
                      className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_LOZENGE[item.difficulty]}`}
                    >
                      {item.difficulty}
                    </span>
                  </button>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <span
                      title={item.settings.theme === "dark" ? "Dark theme" : "Light theme"}
                      className="flex shrink-0 items-center justify-center text-muted"
                    >
                      {item.settings.theme === "dark" ? <MoonIcon /> : <SunIcon />}
                    </span>
                    <button
                      type="button"
                      onClick={() => download(item)}
                      disabled={blocked !== undefined}
                      aria-label={`Download ${item.name}`}
                      title={blocked ?? "Download playable .html"}
                      className={ROW_ICON_BUTTON}
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete this activity"
                      className={ROW_ICON_BUTTON_DANGER}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Modal>

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
