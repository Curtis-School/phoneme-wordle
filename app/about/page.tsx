import { SITE } from "@/lib/site";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function AboutPage() {
  return (
    <PagePlaceholder
      title="About"
      intro="Phoneme Wordle is a frontend builder that lets Speech Pathology teachers create and preview phoneme-based Wordle and Word Search activities, then export each as a single playable HTML file. Assessment 1 is frontend only — no database or dynamic word lists yet."
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
        A short how-to video will be embedded here.
      </p>
    </PagePlaceholder>
  );
}
