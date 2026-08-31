import type { ReactNode } from "react";
import {
  PhonemeStrip,
  PhonemeTile,
} from "@/components/phoneme/PhonemeTile";
import { phonemeHint } from "@/lib/phoneme";
import { PencilIcon, SaveIcon, TrashIcon } from "@/lib/icons";
import { ICON_BUTTON, ICON_BUTTON_ACTIVE, ICON_BUTTON_DANGER } from "@/lib/ui";
import type { PhonemeWord, SymbolDisplay } from "@/lib/types";

/** Editing the clue list is a draft: nothing reaches the API until the activity is saved. */
export type WordSearchEdit = {
  editing: boolean;
  onToggle: () => void;
  onSave: () => void;
  onRemove: (english: string) => void;
  /** The add-a-word form, shown under the list while editing. */
  builder: ReactNode;
};

type WordSearchCluesProps = {
  words: readonly PhonemeWord[];
  found?: readonly string[];
  display?: SymbolDisplay;
  showTooltip?: boolean;
  edit?: WordSearchEdit;
};

export function WordSearchClues({
  words,
  found = [],
  display = "ipa",
  showTooltip = true,
  edit,
}: WordSearchCluesProps) {
  const editing = edit?.editing ?? false;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4.5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Words to find</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            {words.length} words
          </span>
          {edit ? (
            <>
              <button
                type="button"
                onClick={edit.onToggle}
                aria-label={editing ? "Stop editing the word list" : "Edit the word list"}
                aria-expanded={editing}
                title={editing ? "Done editing" : "Edit the word list"}
                className={editing ? ICON_BUTTON_ACTIVE : ICON_BUTTON}
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={edit.onSave}
                aria-label="Save this activity"
                title="Save this activity"
                className={ICON_BUTTON}
              >
                <SaveIcon />
              </button>
            </>
          ) : null}
        </div>
      </div>
      <ul>
        {words.map((word) => {
          const isFound = found.includes(word.english);
          return (
            <li
              key={word.english}
              className={`flex items-center gap-3 border-t border-border/60 px-4.5 py-3 first:border-t-0 ${
                isFound ? "bg-surface-muted/40" : ""
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isFound
                    ? "text-muted line-through"
                    : "text-foreground"
                }`}
              >
                {word.english}
              </span>
              <span className="ml-auto">
                <PhonemeStrip>
                  {word.phonemes.map((phoneme, index) => (
                    <PhonemeTile
                      key={`${word.english}-${index}`}
                      label={phoneme.ipa}
                      reveal={phoneme.english}
                      hint={phonemeHint(phoneme)}
                      display={display}
                      showTooltip={showTooltip}
                      revealed={isFound}
                      size="sm"
                      tone={isFound ? "correct" : "default"}
                    />
                  ))}
                </PhonemeStrip>
              </span>
              {editing ? (
                <button
                  type="button"
                  onClick={() => edit?.onRemove(word.english)}
                  aria-label={`Remove ${word.english} from the list`}
                  title="Remove from this list"
                  className={ICON_BUTTON_DANGER}
                >
                  <TrashIcon />
                </button>
              ) : (
                <span
                  aria-hidden="true"
                  className={`w-5 text-center text-sm font-bold text-primary ${
                    isFound ? "opacity-100" : "opacity-15"
                  }`}
                >
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {editing ? <div className="border-t border-border p-3">{edit?.builder}</div> : null}
    </section>
  );
}
