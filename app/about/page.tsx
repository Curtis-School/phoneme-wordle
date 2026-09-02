import { SITE } from "@/lib/site";
import { PageShell } from "@/components/ui/PageShell";

export default function AboutPage() {
  return (
    <PageShell
      title="About"
      intro="Phoneme Wordle is a frontend builder that lets Speech Pathology teachers create and preview phoneme-based Wordle and Word Search activities, then export each as a single playable HTML file."
    >
      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl border border-border bg-surface p-6 text-sm">
        <dt className="font-medium text-muted">Developer</dt>
        <dd className="text-foreground">{SITE.author}</dd>
        <dt className="font-medium text-muted">Student #</dt>
        <dd className="text-foreground">{SITE.studentNumber}</dd>
        <dt className="font-medium text-muted">Subject</dt>
        <dd className="text-foreground">{SITE.assessment}</dd>
      </dl>
      <p className="text-sm text-muted">
        How-to video:{" "}
        <a
          href={SITE.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Phoneme Wordle video recording (opens in a new tab)"
          aria-label="Phoneme Wordle video recording (opens in a new tab)"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          Watch the Zoom recording
        </a>{" "}
        <span className="whitespace-nowrap">
          (passcode{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-foreground">
            {SITE.demoPasscode}
          </code>
          )
        </span>
      </p>
      <div className="grid max-w-md gap-3 rounded-2xl border border-border bg-surface p-6 text-sm">
        <h2 className="font-semibold text-foreground">How it works</h2>
        <p className="leading-6 text-muted">
          A Next.js frontend renders the activities and the exporters. It reads and
          writes everything through <strong>phoneme-api</strong>, a separate Next.js
          service whose route handlers own a SQLite database via Prisma. Phonemes are
          stored as rows rather than characters, so multi-character IPA symbols like{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            /θ/
          </code>{" "}
          and{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            /eː/
          </code>{" "}
          are never split. Both services run in Docker.
        </p>
      </div>

      <p className="text-sm text-muted">
        Source code:{" "}
        <a
          href={SITE.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Phoneme Wordle frontend source code on GitHub (opens in a new tab)"
          aria-label="Phoneme Wordle frontend source code on GitHub (opens in a new tab)"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          phoneme-wordle
        </a>{" "}
        (frontend) ·{" "}
        <a
          href={SITE.apiRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Phoneme API source code on GitHub (opens in a new tab)"
          aria-label="Phoneme API source code on GitHub (opens in a new tab)"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          phoneme-api
        </a>{" "}
        (backend)
      </p>
    </PageShell>
  );
}
