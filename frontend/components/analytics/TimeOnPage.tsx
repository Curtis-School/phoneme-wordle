"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Below this, a "visit" is a click-through rather than time spent reading. */
const MIN_DWELL_MS = 1000;

/** Matches the API's own cap, so a tab left open overnight is dropped here first. */
const MAX_DWELL_MS = 60 * 60 * 1000;

const SESSION_KEY = "phoneme.session";

function sessionId(): string | undefined {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);

    if (existing) return existing;

    const created = crypto.randomUUID();

    sessionStorage.setItem(SESSION_KEY, created);

    return created;
  } catch {
    // Private browsing can refuse storage; the view is still worth recording without it.
    return undefined;
  }
}

export function TimeOnPage() {
  const pathname = usePathname();
  // Set in the effect: reading the clock during render is impure.
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();

    function flush() {
      const dwellMs = Date.now() - startedAt.current;

      // Restart the clock either way, so a hidden-then-visible tab does not bank the
      // time it spent in the background.
      startedAt.current = Date.now();

      if (dwellMs < MIN_DWELL_MS || dwellMs > MAX_DWELL_MS) return;

      const body = JSON.stringify({ path: pathname, dwellMs, sessionId: sessionId() });

      navigator.sendBeacon?.(
        "/api/page-views",
        new Blob([body], { type: "application/json" }),
      );
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    // Cleanup runs on a route change as well as unmount, which is the other way a
    // visitor leaves a page.
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flush();
    };
  }, [pathname]);

  return null;
}
