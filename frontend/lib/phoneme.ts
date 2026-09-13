import type { Phoneme } from "./types";

export function phonemeHint(phoneme: Phoneme): string {
  return phoneme.example
    ? `${phoneme.label} (${phoneme.example})`
    : phoneme.label;
}
