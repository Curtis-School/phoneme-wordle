"use client";

import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/types";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

type DifficultySelectorProps = {
  currentDifficulty: Difficulty;
};

export function DifficultySelector({ currentDifficulty }: DifficultySelectorProps) {
  const router = useRouter();

  return (
    <select
      aria-label="Difficulty"
      value={currentDifficulty}
      onChange={(event) => router.push(`/wordle?difficulty=${event.target.value}`)}
      className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm font-semibold capitalize text-foreground"
    >
      {DIFFICULTIES.map((difficulty) => (
        <option key={difficulty} value={difficulty}>
          {difficulty}
        </option>
      ))}
    </select>
  );
}
