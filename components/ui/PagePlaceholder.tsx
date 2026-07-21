import type { ReactNode } from "react";

type PagePlaceholderProps = {
  title: string;
  intro: string;
  children?: ReactNode;
};

export function PagePlaceholder({ title, intro, children }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-7 text-muted">{intro}</p>
      {children ?? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
          Coming in a later commit.
        </div>
      )}
    </div>
  );
}
