import Link from "next/link";
import { notFound } from "next/navigation";
import { WordListEditor } from "@/components/library/WordListEditor";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { PageShell } from "@/components/ui/PageShell";
import { ApiClientError, getPhonemes, getWordList, toPhoneme } from "@/lib/api/client";
import { getActivitySettings } from "@/lib/settings-cookie";
import type { ApiWordListDetail } from "@/lib/api/types";
import type { Phoneme } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-AU");
}

export default async function WordListPage({ params }: PageProps<"/library/[id]">) {
  const { id } = await params;
  const listId = Number(id);

  if (!Number.isInteger(listId) || listId <= 0) {
    notFound();
  }

  let list: ApiWordListDetail;
  let inventory: Phoneme[];

  try {
    [list, inventory] = await Promise.all([getWordList(listId), getPhonemes()]);
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "NOT_FOUND") {
      notFound();
    }

    return (
      <PageShell title="Word list" intro="">
        <ApiErrorNotice
          title="This word list could not be loaded"
          message={
            error instanceof ApiClientError
              ? error.message
              : "The stored word list could not be read."
          }
          hint="Start the API with `docker compose up` from the repo root (or `npm run dev` in backend/), then reload this page."
        />
      </PageShell>
    );
  }

  const settings = await getActivitySettings();
  const targetPhoneme = list.targetPhoneme ? toPhoneme(list.targetPhoneme) : null;

  return (
    <PageShell
      title={list.name}
      intro={list.description ?? "A stored word list that activities can be built from."}
    >
      <Link
        href="/library"
        className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        ← All word lists
      </Link>

      <section
        aria-labelledby="stored-heading"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <h2
          id="stored-heading"
          className="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Stored record
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Target sound</dt>
            <dd className="text-sm font-semibold text-foreground">
              {targetPhoneme ? `${targetPhoneme.ipa} — ${targetPhoneme.example}` : "None"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Used by</dt>
            <dd className="text-sm font-semibold text-foreground">
              {list.activityCount}{" "}
              {list.activityCount === 1 ? "activity" : "activities"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Created</dt>
            <dd className="text-sm font-semibold text-foreground">
              {formatDateTime(list.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Last updated</dt>
            <dd className="text-sm font-semibold text-foreground">
              {formatDateTime(list.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>

      <WordListEditor
        listId={list.id}
        words={list.words.map((word) => ({
          id: word.id,
          english: word.english,
          phonemes: word.phonemes.map(toPhoneme),
        }))}
        inventory={inventory}
        display={settings.symbolDisplay}
        activityCount={list.activityCount}
        targetPhoneme={targetPhoneme}
      />
    </PageShell>
  );
}
