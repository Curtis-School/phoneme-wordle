import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-medium text-foreground">{SITE.author}</span>
          {" · Student #"}
          {SITE.studentNumber}
        </p>
        <p>{SITE.assessment} · Frontend only</p>
      </div>
    </footer>
  );
}
