"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listAlerts } from "@/lib/alerts/api";

/** How often the count refreshes on its own while the dashboard is open. */
const POLL_MS = 3 * 60 * 1000;

type UnreadAlerts = {
  /** Unread alerts across the roster; null until the first load. */
  count: number | null;
  /** Re-read the count now: call after marking one or all as read. */
  refresh: () => void;
};

const UnreadAlertsContext = createContext<UnreadAlerts>({ count: null, refresh: () => {} });

/**
 * The unread-alert count behind the header bell, shared with the Alerts page
 * that changes it (the header used to fetch it once on mount, so the badge
 * went stale the moment an alert was marked read). Same pattern as
 * OpenRequestsProvider: nutritionists only (AppShell); refreshes on mount,
 * every POLL_MS, when the tab is visible again, and on demand.
 */
export function UnreadAlertsProvider({ children }: { children: React.ReactNode }) {
  const { authorizedFetch } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(() => {
    listAlerts(authorizedFetch, { is_read: false }).then((r) => {
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

  return <UnreadAlertsContext.Provider value={{ count, refresh }}>{children}</UnreadAlertsContext.Provider>;
}

export function useUnreadAlerts(): UnreadAlerts {
  return useContext(UnreadAlertsContext);
}
