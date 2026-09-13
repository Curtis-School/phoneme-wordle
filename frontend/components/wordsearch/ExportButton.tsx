"use client";

import { ExportButton as ExportButtonBase } from "@/components/ui/ExportButton";
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

export function ExportButton({ phoneme, words, puzzle, settings }: ExportButtonProps) {
  return (
    <ExportButtonBase
      variant="card"
      title="A self-contained HTML puzzle that plays offline, matching what is shown here"
      onExport={() =>
        downloadHtml(
          `phoneme-word-search-${phoneme.english}.html`,
          buildWordSearchHtml(phoneme, words, puzzle, settings),
        )
      }
    />
  );
}
