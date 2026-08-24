"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ReloadIcon } from "@/lib/icons";
import type { SoundOption } from "@/lib/api/builder/word-search";

type TargetSoundControlsProps = {
  current: string;
  options: readonly SoundOption[];
};

export function TargetSoundControls({ current, options }: TargetSoundControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Only sounds with words are offered, so a draw always lands on a playable puzzle.
  function draw() {
    const stocked = options.filter(
      (option) => option.wordCount > 0 && option.phoneme.ipa !== current,
    );

    if (stocked.length === 0) return;

    const next = stocked[Math.floor(Math.random() * stocked.length)].phoneme.ipa;

    startTransition(() => {
      router.replace(`/word-search?phoneme=${encodeURIComponent(next)}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={draw}
      disabled={isPending}
      aria-label="Try a different sound"
      title="Try a different sound"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
    >
      <ReloadIcon />
    </button>
  );
}
