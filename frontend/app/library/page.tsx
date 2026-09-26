import Link from "next/link";
import { CreateWordListForm } from "@/components/library/CreateWordListForm";
import { PhonemeTile } from "@/components/phoneme/PhonemeTile";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";
import { PageShell } from "@/components/ui/PageShell";
import { ArrowRightIcon } from "@/lib/icons";
import { ApiClientError, getPhonemes, listWordLists } from "@/lib/api/client";
import type { ApiWordListSummary } from "@/lib/api/types";
import type { Phoneme } from "@/lib/types";

export const dynamic = "force-dynamic";

const INTRO =
  "Browse and edit the stored word lists every activity is built from, and the phoneme inventory behind them. Changes here are written straight to the database.";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function LibraryPage() {
  let lists: ApiWordListSummary[];
  let inventory: Phoneme[];

  try {
    [lists, inventory] = await Promise.all([listWordLists(), getPhonemes()]);
  } catch (error) {
    return (
      <PageShell title="Library" intro={INTRO}>
        <ApiErrorNotice
          title="The library could not be loaded"
          message={
            error instanceof ApiClientError
              ? error.message
              : "The stored word lists could not be read."
          }
          hint="Start the API with `docker compose up` from the repo root (or `npm run dev` in backend/), then reload this page."
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Library" intro={INTRO}>
      <CreateWordListForm inventory={inventory} />

      <section aria-labelledby="lists-heading" className="flex flex-col gap-3">
        <h2
          id="lists-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Word lists ({lists.length})
        </h2>

        {lists.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-5 py-6 text-sm text-muted">
            No word lists are stored yet. Create one above, or seed the database with
            `npm run db:seed` in backend/.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Stored word lists, with their target sound, size and last update.
              </caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Target sound</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Words</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Activities</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list) => (
                  <tr key={list.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium">
                      <Link
                        href={`/library/${list.id}`}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        {list.name}
                      </Link>
                      {list.description ? (
                        <span className="mt-0.5 block text-xs font-normal text-muted">
                          {list.description}
                        </span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3 text-muted">
                      {list.targetPhoneme ? list.targetPhoneme.ipa : "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground">{list.wordCount}</td>
                    <td className="px-4 py-3 text-foreground">{list.activityCount}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(list.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/library/${list.id}`}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        View words
                        <ArrowRightIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="inventory-heading" className="flex flex-col gap-3">
        <h2
          id="inventory-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Phoneme inventory ({inventory.length})
        </h2>
        <details className="rounded-2xl border border-border bg-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Show every stored sound
          </summary>
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
            {inventory.map((phoneme) => (
              <li
                key={phoneme.ipa}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-2.5 py-2"
              >
                <PhonemeTile label={phoneme.ipa} size="sm" />
                <span className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {phoneme.label}
                  </span>
                  <span className="text-[0.625rem] leading-4 text-muted">
                    {phoneme.example}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </PageShell>
  );
}
