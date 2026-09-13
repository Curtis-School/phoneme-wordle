"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_LINKS, PRIMARY_LINKS, SECONDARY_LINKS } from "@/lib/site";
import { HamburgerMenu } from "./HamburgerMenu";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex items-center gap-1">
      <ul className="hidden items-center gap-1 md:flex">
        {PRIMARY_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-foreground hover:bg-surface-muted"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block">
        <HamburgerMenu
          links={SECONDARY_LINKS}
          label="More options"
          variant="kebab"
        />
      </div>

      <div className="md:hidden">
        <HamburgerMenu
          links={ALL_LINKS}
          label="Open navigation menu"
          variant="hamburger"
        />
      </div>
    </nav>
  );
}
