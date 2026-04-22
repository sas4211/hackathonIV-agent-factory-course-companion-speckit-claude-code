"use client";

import { useEffect, useState } from "react";
import type { AppUser } from "./types";

const FALLBACK_USER: AppUser = {
  id: "demo_user",
  email: "demo@coursecompanion.dev",
  firstName: "Demo",
  lastName: "Student",
  tier: "free",
  isAdmin: false,
};

/**
 * Returns the current demo user injected by RootLayout via data attribute.
 * In production with Clerk, pages should call useUser() from @clerk/nextjs directly.
 */
export function useDemoUser(): { user: AppUser; loading: boolean } {
  const [user, setUser] = useState<AppUser>(FALLBACK_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = document.querySelector("[data-demo-user]");
    if (el) {
      try {
        const raw = el.getAttribute("data-demo-user");
        if (raw && raw !== "null") {
          const parsed = JSON.parse(raw) as AppUser;
          setUser(parsed);
        }
      } catch {
        // keep fallback
      }
    }
    setLoading(false);
  }, []);

  // Re-check whenever DOM might have updated (e.g., user switches role)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector("[data-demo-user]");
      if (el) {
        try {
          const raw = el.getAttribute("data-demo-user");
          if (raw && raw !== "null") {
            const parsed = JSON.parse(raw) as AppUser;
            setUser(parsed);
          }
        } catch {
          // keep current
        }
      }
    });

    const el = document.querySelector("[data-demo-user]");
    if (el) {
      observer.observe(el, { attributes: true, attributeFilter: ["data-demo-user"] });
    }

    return () => observer.disconnect();
  }, []);

  return { user, loading };
}
