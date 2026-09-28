"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAdminOverview } from "@/lib/admin/api";

/** How often the count refreshes on its own while the admin panel is open. */
const POLL_MS = 3 * 60 * 1000;

type PendingFoods = {
  /** Foods waiting for review; null until the first load. */
  count: number | null;
  /** Re-read the count now — call after anything that changes it. */
  refresh: () => void;
};

const PendingFoodsContext = createContext<PendingFoods>({ count: null, refresh: () => {} });

/**
 * Number of nutritionist-submitted foods waiting for admin review, shared
 * by the sidebar badge and the screens that change it. Mounted only for
 * admins (AppShell). Refreshes on mount, every POLL_MS, whenever the tab
 * becomes visible again, and on demand via `refresh()` right after an
 * approve / reject / delete — so the badge never waits for a reload.
 */
export function PendingFoodsProvider({ children }: { children: React.ReactNode }) {
  const { authorizedFetch } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(() => {
    getAdminOverview(authorizedFetch).then((r) => {
      if (r.ok) setCount(r.data.foods_pending);
    });
  }, [authorizedFetch]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <PendingFoodsContext.Provider value={{ count, refresh }}>{children}</PendingFoodsContext.Provider>;
}

export function usePendingFoods(): PendingFoods {
  return useContext(PendingFoodsContext);
}
