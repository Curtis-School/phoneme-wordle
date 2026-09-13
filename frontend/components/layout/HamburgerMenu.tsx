"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/site";
import { HamburgerIcon, KebabIcon } from "@/lib/icons";

type Variant = "hamburger" | "kebab";

type HamburgerMenuProps = {
  links: readonly NavLink[];
  label: string;
  variant?: Variant;
};

export function HamburgerMenu({
  links,
  label,
  variant = "hamburger",
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-surface-muted"
      >
        {variant === "kebab" ? <KebabIcon /> : <HamburgerIcon />}
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg shadow-black/5"
        >
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href} role="none">
                <Link
                  role="menuitem"
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`block px-4 py-2 text-sm transition-colors hover:bg-surface-muted ${
                    active
                      ? "font-semibold text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
