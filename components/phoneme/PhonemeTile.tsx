import type { ReactNode } from "react";
import type { SymbolDisplay } from "@/lib/types";

export type PhonemeTone =
  | "default"
  | "muted"
  | "correct"
  | "present"
  | "absent";

export type PhonemeSize = "sm" | "board" | "lg";

type PhonemeTileProps = {
  label?: string;
  reveal?: string;
  hint?: string;
  display?: SymbolDisplay;
  revealed?: boolean;
  showTooltip?: boolean;
  tone?: PhonemeTone;
  size: PhonemeSize;
  className?: string;
};

const TONE_CLASSES: Record<PhonemeTone, string> = {
  default: "border border-border bg-surface text-foreground",
  muted: "border border-border/60 bg-surface-muted text-muted",
  correct: "border border-correct bg-correct text-correct-foreground",
  present: "border border-present bg-present text-present-foreground",
  absent: "border border-absent bg-absent text-absent-foreground",
};

const SIZE_CLASSES: Record<PhonemeSize, string> = {
  sm: "size-8 text-xs",
  board: "size-11 text-sm",
  lg: "size-14 text-lg",
};

export function PhonemeTile({
  label,
  reveal,
  hint,
  display = "ipa",
  revealed = false,
  showTooltip = true,
  tone = "default",
  size,
  className = "",
}: PhonemeTileProps) {
  const base = `flex select-none flex-col items-center justify-center rounded-lg font-semibold leading-none ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`;
  const title = showTooltip && hint ? hint : undefined;

  if (reveal) {
    if (revealed) {
      return (
        <div title={title} className={base}>
          <span className="uppercase tracking-tight">{reveal}</span>
        </div>
      );
    }

    const englishDefault = display === "english";
    const front = englishDefault ? reveal : label;
    const back = englishDefault ? label : reveal;

    return (
      <div title={title} className={`group relative ${base}`}>
        <span
          className={`tracking-tight transition-opacity group-hover:opacity-0 ${
            englishDefault ? "uppercase" : ""
          }`}
        >
          {front}
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${
            englishDefault ? "" : "uppercase"
          }`}
        >
          {back}
        </span>
      </div>
    );
  }

  return (
    <div title={title} className={base}>
      <span className="uppercase tracking-tight">{label}</span>
    </div>
  );
}

export function PhonemeStrip({
  children,
  nowrap = false,
}: {
  children: ReactNode;
  nowrap?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${nowrap ? "flex-nowrap" : "flex-wrap"}`}
    >
      {children}
    </div>
  );
}
