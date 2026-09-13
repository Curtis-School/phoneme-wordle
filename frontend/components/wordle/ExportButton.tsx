"use client";

import { ExportButton as ExportButtonBase } from "@/components/ui/ExportButton";
import type { ActivitySettings, Phoneme, WordleConfig } from "@/lib/types";
import { buildWordleHtml } from "@/lib/html-export/wordle-template";
import { downloadHtml } from "@/lib/html-export/download";

type ExportButtonProps = {
  config: WordleConfig;
  keys: readonly Phoneme[];
  settings: ActivitySettings;
};

export function ExportButton({ config, keys, settings }: ExportButtonProps) {
  return (
    <ExportButtonBase
      variant="inline"
      onExport={() =>
        downloadHtml(
          `phoneme-wordle-${config.englishWord}.html`,
          buildWordleHtml(config, keys, settings),
        )
      }
    />
  );
}
