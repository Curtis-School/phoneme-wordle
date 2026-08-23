"use client";

import type { ActivitySettings, Phoneme, PhonemeWord } from "@/lib/types";
import type { GeneratedWordSearch } from "@/lib/wordsearch";
import { buildWordSearchHtml } from "@/lib/html-export/word-search-template";
import { downloadHtml } from "@/lib/html-export/download";
import { DownloadIcon } from "@/lib/icons";

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
      className="mt-3.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover"
    >
      <DownloadIcon />
      Export playable .html
    </button>
  );
}
