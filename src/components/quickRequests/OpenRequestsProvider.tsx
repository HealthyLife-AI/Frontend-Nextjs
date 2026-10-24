"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listQuickRequests } from "@/lib/quickRequests/api";

/** How often the count refreshes on its own while the dashboard is open. */
const POLL_MS = 3 * 60 * 1000;

type OpenRequests = {
  /** Open patient requests; null until the first load. */
  count: number | null;
  /** Re-read the count now: call after a reply or a close. */
  refresh: () => void;
};

const OpenRequestsContext = createContext<OpenRequests>({ count: null, refresh: () => {} });

/**
 * Phase 1, E6: the open-request count behind the sidebar's «الطلبات» badge,
 * shared with the screens that change it. Mounted for nutritionists only
 * (AppShell). Refreshes on mount, every POLL_MS, when the tab is visible
 * again, and on demand.
 */
export function OpenRequestsProvider({ children }: { children: React.ReactNode }) {
  const { authorizedFetch } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(() => {
    listQuickRequests(authorizedFetch, "open").then((r) => {
      if (r.ok) setCount(r.data.meta.total);
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

  return <OpenRequestsContext.Provider value={{ count, refresh }}>{children}</OpenRequestsContext.Provider>;
}

export function useOpenRequests(): OpenRequests {
  return useContext(OpenRequestsContext);
}
