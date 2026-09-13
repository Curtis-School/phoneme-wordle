import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

export function PageShell({ title, intro, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-muted">
          {intro}
        </p>
      </div>
      {children}
    </div>
  );
}
