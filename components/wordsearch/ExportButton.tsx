"use client";

import type { ActivitySettings, Phoneme, PhonemeWord } from "@/lib/types";
import type { GeneratedWordSearch } from "@/lib/wordsearch";
import { buildWordSearchHtml } from "@/lib/html-export/word-search-template";
import { downloadHtml } from "@/lib/html-export/download";

type ExportButtonProps = {
  phoneme: Phoneme;
  words: readonly PhonemeWord[];
  puzzle: GeneratedWordSearch;
  settings: ActivitySettings;
};

export function ExportButton({
  phoneme,
  words,
  puzzle,
  settings,
}: ExportButtonProps) {
  function handleExport() {
    const html = buildWordSearchHtml(phoneme, words, puzzle, settings);
    downloadHtml(`phoneme-word-search-${phoneme.english}.html`, html);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
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
