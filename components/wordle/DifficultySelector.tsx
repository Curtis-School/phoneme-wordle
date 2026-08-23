"use client";

import { useRouter } from "next/navigation";
import type { WordleActivity } from "@/lib/api/builder";

type DifficultySelectorProps = {
  tiers: readonly WordleActivity[];
  currentId: number;
};

export function DifficultySelector({ tiers, currentId }: DifficultySelectorProps) {
  const router = useRouter();

  if (tiers.length < 2) return null;

  return (
    <select
      aria-label="Difficulty"
      value={currentId}
      onChange={(event) => {
        const tier = tiers.find((candidate) => candidate.id === Number(event.target.value));
        if (tier) router.push(`/wordle?difficulty=${tier.difficulty}`);
      }}
      className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm font-semibold capitalize text-foreground"
    >
      {tiers.map((tier) => (
        <option key={tier.id} value={tier.id}>
          {tier.difficulty} — {tier.wordLength} sounds
        </option>
      ))}
    </select>
  );
}
