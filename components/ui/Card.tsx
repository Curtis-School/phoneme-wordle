import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
  href?: string;
  cta?: string;
  badge?: ReactNode;
};

export function Card({ title, children, href, cta = "Open", badge }: CardProps) {
  const inner = (
    <>
      {badge && (
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-2xl bg-surface-muted text-2xl font-bold text-primary"
        >
          {badge}
        </span>
      )}
      <h2 className="mt-5 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
      {href && (
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {cta}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      )}
    </>
  );

  const base =
    "flex flex-col rounded-3xl border border-border bg-surface p-7 text-left shadow-sm shadow-black/5";

  if (href) {
    return (
      <Link
        href={href}
        className={`group ${base} transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md hover:shadow-primary/10`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={base}>{inner}</div>;
}
