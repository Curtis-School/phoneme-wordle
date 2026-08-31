"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/lib/icons";

const WIDTHS = {
  sm: "w-[min(92vw,24rem)]",
  md: "w-[min(92vw,26rem)]",
  lg: "w-[min(92vw,32rem)]",
  xl: "w-[min(92vw,34rem)]",
} as const;

export type ModalWidth = keyof typeof WIDTHS;

type ModalProps = {
  open: boolean;
  title: string;
  width?: ModalWidth;
  closeButton?: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  open,
  title,
  width = "md",
  closeButton = true,
  onClose,
  children,
}: ModalProps) {
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
      onCancel={onClose}
      onClose={onClose}
      className={`m-auto ${WIDTHS[width]} rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/50`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {closeButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      {children}
    </dialog>
  );
}
