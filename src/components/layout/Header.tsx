"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { listAlerts } from "@/lib/alerts/api";
import { LocaleSwitcher } from "./LocaleSwitcher";

/**
 * Fixed top bar. Offset past the sidebar via logical `start-64` only at
 * `lg:` and up — below that the sidebar is an off-canvas drawer (see
 * Sidebar.tsx) so the header spans full width and gets a hamburger
 * toggle instead. Ported from the approved Stitch header
 * (design-reference/.../nutricare_3), recolored to the PRD tokens.
 */
export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const t = useTranslations("nav");
  const { logout, authorizedFetch } = useAuth();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  // Mount-once, not polled: neither S5-08 nor S5-09 asks for realtime,
  // and Header persists across client-side navigation, so a poll here
  // would need its own cleanup story this feature doesn't need yet.
  useEffect(() => {
    let cancelled = false;

    listAlerts(authorizedFetch, { is_read: false }).then((result) => {
      if (!cancelled && result.ok) setUnreadCount(result.data.meta.total);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border bg-card/90 px-4 shadow-[0_1px_0_rgba(11,46,48,0.03),0_4px_12px_-6px_rgba(11,46,48,0.06)] backdrop-blur-sm sm:px-6 lg:start-64">
      {/*
        No header search box: it had no value/onChange/handler, and
        Patients already has a real, URL-driven search — two boxes, one
        fake, is worse than one real one. `onMenuClick` still needs
        somewhere to live at narrow widths, so this wrapper stays.
      */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>

        {/*
          No calendar button: appointments (Rama's top-5, Kholod's
          evaluation-date reminders) is real and validated, but it is a
          full module — booking, conflicts, reminders, client-app sync —
          scheduled as the first Post-MVP feature, not before the pilot.
          A dead button in front of the person who asked for it is worse
          than no button.
        */}

        <Link
          href="/dashboard/alerts"
          className="relative flex h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label={t("alerts")}
        >
          <Bell size={20} strokeWidth={1.75} />
          {!!unreadCount && (
            <span className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-late px-1 text-[10px] font-semibold tabular-nums text-card">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-10 items-center gap-2 rounded-control px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink sm:px-3"
          aria-label={t("signOut")}
        >
          {/* Directional glyph (arrow out of a door) — mirror in RTL so
              the arrow still points "away", matching the reading direction. */}
          <LogOut size={18} strokeWidth={1.75} className="rtl:-scale-x-100" />
          <span className="hidden sm:inline">{t("signOut")}</span>
        </button>
      </div>
    </header>
  );
}
