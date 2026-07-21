import Link from "next/link";
import { SITE } from "@/lib/site";
import { NavBar } from "./NavBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg"
          aria-label={`${SITE.title} — home`}
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-on-primary"
          >
            æ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">
              {SITE.title}
            </span>
            <span className="hidden text-xs text-muted sm:block">
              {SITE.subtitle} · {SITE.assessment}
            </span>
          </span>
        </Link>

        <NavBar />
      </div>
    </header>
  );
}
