"use client";

import type { ActivitySettings, Phoneme, WordleConfig } from "@/lib/types";
import { buildWordleHtml } from "@/lib/html-export/wordle-template";
import { downloadHtml } from "@/lib/html-export/download";

type ExportButtonProps = {
  config: WordleConfig;
  keys: readonly Phoneme[];
  settings: ActivitySettings;
};

export function ExportButton({ config, keys, settings }: ExportButtonProps) {
  function handleExport() {
    const html = buildWordleHtml(config, keys, settings);
    downloadHtml(`phoneme-wordle-${config.englishWord}.html`, html);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="mt-3.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover"
    >
      <DownloadIcon />
      Export playable .html
    </button>
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
