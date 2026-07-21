import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 py-6 text-center">
      <section className="flex flex-col items-center gap-4">
        <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-primary">
          Speech Pathology · Phoneme activities
        </span>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Build phoneme-based classroom activities in a few clicks.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted">
          Configure and preview a phoneme <strong>Wordle</strong> or{" "}
          <strong>Word Search</strong>, then export it as a single, self-contained
          HTML file that plays offline in any browser — ready for your students.
        </p>
      </section>

      <section
        aria-labelledby="activities-heading"
        className="flex w-full flex-col items-center gap-5"
      >
        <h2
          id="activities-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Choose an activity
        </h2>
        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          <Card title="Phoneme Wordle" href="/wordle" cta="Build a Wordle" badge="/θ/">
            Guess a phoneme-based word using sound tiles. Standard green / yellow /
            grey feedback, applied to phoneme identity rather than spelling.
          </Card>
          <Card
            title="Phoneme Word Search"
            href="/word-search"
            cta="Build a Word Search"
            badge="æ"
          >
            Pick a target sound and generate a grid of real words that contain it,
            each with an accessible phoneme breakdown.
          </Card>
        </div>
      </section>
    </div>
  );
}
