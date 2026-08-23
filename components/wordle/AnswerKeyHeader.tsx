import { DifficultySelector } from "@/components/wordle/DifficultySelector";
import type { WordleActivity } from "@/lib/api/builder";

type AnswerKeyHeaderProps = {
  tiers: readonly WordleActivity[];
  currentId: number;
};

export function AnswerKeyHeader({ tiers, currentId }: AnswerKeyHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Answer key</h2>
        <DifficultySelector tiers={tiers} currentId={currentId} />
      </div>
    </div>
  );
}
