import type { ReactNode } from "react";
import type { SymbolDisplay } from "@/lib/types";

export type PhonemeTone =
  | "default"
  | "muted"
  | "correct"
  | "present"
  | "absent";

export type PhonemeSize = "sm" | "board" | "md" | "lg";

type PhonemeTileProps = {
  label?: string;
  ipa?: string;
  reveal?: string;
  hint?: string;
  display?: SymbolDisplay;
  revealed?: boolean;
  showTooltip?: boolean;
  tone?: PhonemeTone;
  size?: PhonemeSize;
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
  md: "size-12 text-base",
  lg: "size-14 text-lg",
};

export function PhonemeTile({
  label,
  ipa,
  reveal,
  hint,
  display = "ipa",
  revealed = false,
  showTooltip = true,
  tone = "default",
  size = "md",
  className = "",
}: PhonemeTileProps) {
  const base = `flex select-none flex-col items-center justify-center rounded-lg font-semibold leading-none ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`;
  const title = showTooltip && hint ? hint : undefined;

  if (ipa) {
    return (
      <div title={title} className={base}>
        <span className="uppercase tracking-tight">{label}</span>
        <span className="mt-0.5 text-[0.6em] font-normal opacity-70">
          {ipa}
        </span>
      </div>
    );
  }

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

export function PhonemeStrip({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}
