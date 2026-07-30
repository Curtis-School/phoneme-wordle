import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  intro: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function PageShell({ title, intro, children, aside }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-base leading-7 text-muted">{intro}</p>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}
