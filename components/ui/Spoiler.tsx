"use client";

import { useState, type ReactNode } from "react";
import { ACTION_BUTTON } from "@/lib/ui";

type SpoilerProps = {
  /** Named on the toggle, e.g. "answer" gives "Show answer" / "Hide answer". */
  label: string;
  children: ReactNode;
};

/**
 * Keeps a spoiler out of sight until asked for. The content stays mounted so
 * anything with its own state survives a peek, and `inert` keeps it off the
 * tab order while it is blurred.
 */
export function Spoiler({ label, children }: SpoilerProps) {
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShown((open) => !open)}
        aria-expanded={shown}
        className={`${ACTION_BUTTON} self-start`}
      >
        {shown ? `Hide ${label}` : `Show ${label}`}
      </button>

      <div className="relative">
        <div
          inert={!shown}
          className={
            shown ? "" : "pointer-events-none select-none blur-[5px] saturate-50"
          }
        >
          {children}
        </div>

        {shown ? null : (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="absolute inset-0 rounded-xl text-sm font-semibold text-muted transition-colors hover:bg-surface-muted/40"
          >
            Tap to reveal
          </button>
        )}
      </div>
    </div>
  );
}
