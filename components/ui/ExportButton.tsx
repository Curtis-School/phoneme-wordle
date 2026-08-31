"use client";

import { DownloadIcon } from "@/lib/icons";

const VARIANTS = {
  inline:
    "mt-3.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover",
  card: "flex h-full min-h-18 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover",
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
