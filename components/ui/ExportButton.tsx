"use client";

import { DownloadIcon } from "@/lib/icons";

const VARIANTS = {
  inline:
    "mt-3.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-surface-muted",
  card: "flex h-full min-h-18 w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-surface-muted",
} as const;

type ExportButtonProps = {
  variant: keyof typeof VARIANTS;
  title?: string;
  onExport: () => void;
};

export function ExportButton({ variant, title, onExport }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      title={title}
      className={VARIANTS[variant]}
    >
      <DownloadIcon />
      Export playable .html
    </button>
  );
}
