"use client";

import { Modal } from "./Modal";
import { DANGER_BUTTON, SECONDARY_BUTTON } from "@/lib/ui";

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
  return (
    <Modal open={open} title={title} width="sm" closeButton={false} onClose={onCancel}>
      <p className="mt-2 text-sm leading-5 text-muted">{message}</p>

      <div className="mt-4 flex gap-1.5">
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className={DANGER_BUTTON}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
