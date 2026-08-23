import type { Difficulty, Phoneme } from "@/lib/types";

export type GuessState = "correct" | "present" | "absent";

export function buildKeyboard(
  answer: readonly Phoneme[],
  inventory: readonly Phoneme[],
  size = 12,
): Phoneme[] {
  const seen = new Set<string>();
  const keys: Phoneme[] = [];

  const add = (phoneme: Phoneme) => {
    if (seen.has(phoneme.ipa)) return;
    seen.add(phoneme.ipa);
    keys.push(phoneme);
  };

  answer.forEach(add);
  for (const phoneme of inventory) {
    if (keys.length >= size) break;
    add(phoneme);
  }

  return keys.sort((a, b) => a.label.localeCompare(b.label));
}

export function evaluateGuess(
  guess: readonly string[],
  answer: readonly string[],
): GuessState[] {
  const states: GuessState[] = guess.map(() => "absent");
  const remaining = new Map<string, number>();

  for (const id of answer) {
    remaining.set(id, (remaining.get(id) ?? 0) + 1);
  }

  guess.forEach((id, i) => {
    if (answer[i] === id) {
      states[i] = "correct";
      remaining.set(id, (remaining.get(id) ?? 0) - 1);
    }
  });

  guess.forEach((id, i) => {
    if (states[i] === "correct") return;
    const left = remaining.get(id) ?? 0;
    if (left > 0) {
      states[i] = "present";
      remaining.set(id, left - 1);
    }
  });

  return states;
}

export function isSolved(states: readonly GuessState[]): boolean {
  return states.length > 0 && states.every((state) => state === "correct");
}

const GUESSES: Record<Difficulty, number> = { easy: 4, medium: 5, hard: 6 };

export function guessesFor(difficulty: Difficulty): number {
  return GUESSES[difficulty];
}
