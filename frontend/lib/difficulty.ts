import type { Difficulty } from "./types";

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"] as const;

export const DIFFICULTY_ACCENT: Record<Difficulty, string> = {
  easy: "border-l-correct",
  medium: "border-l-present",
  hard: "border-l-absent",
};

export const DIFFICULTY_LOZENGE: Record<Difficulty, string> = {
  easy: "bg-correct/10 text-correct",
  medium: "bg-present/10 text-present",
  hard: "bg-absent/10 text-absent",
};
