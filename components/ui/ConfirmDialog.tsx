"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      className="m-auto w-[min(92vw,24rem)] rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/50"
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-muted">{message}</p>

      <div className="mt-4 flex gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 flex-1 rounded-lg border border-border text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 flex-1 rounded-lg bg-present text-sm font-bold text-present-foreground transition-colors hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
