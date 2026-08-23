import { DifficultySelector } from "@/components/wordle/DifficultySelector";
import type { Difficulty } from "@/lib/types";

type AnswerKeyHeaderProps = {
  currentDifficulty: Difficulty;
};

export function AnswerKeyHeader({ currentDifficulty }: AnswerKeyHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Answer key</h2>
        <DifficultySelector currentDifficulty={currentDifficulty} />
      </div>
    </div>
  );
}
