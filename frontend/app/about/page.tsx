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
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Assessment 1 demo
        </h2>
        <p className="text-sm text-muted">
          How-to video:{" "}
          <a
            href={SITE.demos.assessment1.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Phoneme Wordle Assessment 1 video recording (opens in a new tab)"
            aria-label="Phoneme Wordle Assessment 1 video recording (opens in a new tab)"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Watch the Zoom recording
          </a>{" "}
          <span className="whitespace-nowrap">
            (passcode{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-foreground">
              {SITE.demos.assessment1.passcode}
            </code>
            )
          </span>
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Assessment 2 demo
        </h2>
        <p className="text-sm text-muted">
          How-to video:{" "}
          <a
            href={SITE.demos.assessment2.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Phoneme Wordle Assessment 2 video recording (opens in a new tab)"
            aria-label="Phoneme Wordle Assessment 2 video recording (opens in a new tab)"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Watch the Zoom recording
          </a>{" "}
          <span className="whitespace-nowrap">
            (passcode{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-foreground">
              {SITE.demos.assessment2.passcode}
            </code>
            )
          </span>
        </p>
      </section>

      <p className="text-sm text-muted">
        Source code:{" "}
        <a
          href={SITE.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Phoneme Wordle source code on GitHub (opens in a new tab)"
          aria-label="Phoneme Wordle source code on GitHub (opens in a new tab)"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          phoneme-wordle
        </a>
      </p>
    </PageShell>
  );
}
