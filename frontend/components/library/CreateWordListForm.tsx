"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createList } from "@/lib/library-actions";
import { ERROR_TEXT, PRIMARY_ACTION_BUTTON, TEXT_INPUT } from "@/lib/ui";
import type { Phoneme } from "@/lib/types";

export function CreateWordListForm({ inventory }: { inventory: readonly Phoneme[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetPhoneme, setTargetPhoneme] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);

    startTransition(async () => {
      const result = await createList({ name, description, targetPhoneme });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setName("");
      setDescription("");
      setTargetPhoneme("");
      router.push(`/library/${result.id}`);
    });
  }

  return (
    <form
      onSubmit={submit}
      aria-labelledby="create-list-heading"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
    >
      <h2 id="create-list-heading" className="text-sm font-semibold text-foreground">
        New word list
      </h2>

      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
            required
            maxLength={80}
            placeholder="e.g. /θ/ starters"
            className={TEXT_INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          <span>
            Description <span className="font-normal">(optional)</span>
          </span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isPending}
            maxLength={300}
            placeholder="What this list is for"
            className={TEXT_INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          <span>
            Target sound <span className="font-normal">(optional)</span>
          </span>
          <select
            value={targetPhoneme}
            onChange={(event) => setTargetPhoneme(event.target.value)}
            disabled={isPending}
            className={TEXT_INPUT}
          >
            <option value="">No target sound</option>
            {inventory.map((phoneme) => (
              <option key={phoneme.ipa} value={phoneme.ipa}>
                {phoneme.ipa} — {phoneme.example}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p role="alert" className={ERROR_TEXT}>
          {error}
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={isPending} className={PRIMARY_ACTION_BUTTON}>
          {isPending ? "Creating…" : "Create list"}
        </button>
      </div>
    </form>
  );
}
