"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { listAlerts } from "@/lib/alerts/api";
import { LocaleSwitcher } from "./LocaleSwitcher";

const SECTIONS = [
  { href: "/dashboard/patients", key: "patients" },
  { href: "/dashboard/plans", key: "plans" },
  { href: "/dashboard/alerts", key: "alerts" },
  { href: "/dashboard/settings", key: "settings" },
  { href: "/dashboard", key: "dashboard" },
] as const;

/**
 * Fixed top bar, offset past the 288px sidebar via logical `start-72` at
 * `lg:` and up; full width with a hamburger below that. Shows where you
 * are (section name + today's date, in the page's locale) on the
 * inline-start side and the alerts bell + locale switcher on the other —
 * a frosted white bar in the landing header's style. Sign-out lives in
 * the sidebar's account card.
 */
export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { authorizedFetch } = useAuth();

  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const section = SECTIONS.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));

  // Mount-once, not polled: nothing asks for realtime yet, and Header
  // persists across client-side navigation.
  useEffect(() => {
    let cancelled = false;

    listAlerts(authorizedFetch, { is_read: false }).then((result) => {
      if (!cancelled && result.ok) setUnreadCount(result.data.meta.total);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  // Header only mounts after AppShell sees an authenticated session, which
  // is resolved client-side — it never server-renders, so formatting the
  // viewer's own date during render can't cause a hydration mismatch.
  const today = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-border/60 bg-white/80 px-4 backdrop-blur-xl sm:px-8 lg:start-72">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-border text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <div className="flex min-w-0 flex-col">
          {section && <span className="truncate text-base font-bold text-ink">{t(section.key)}</span>}
          <span className="truncate text-xs text-ink-muted">{today}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>

        <Link
          href="/dashboard/alerts"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-ink-muted transition-colors hover:border-primary/30 hover:bg-mkt-mint-bg hover:text-mkt-teal-deep"
          aria-label={t("alerts")}
        >
          <Bell size={19} strokeWidth={1.9} />
          {!!unreadCount && (
            <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-status-late px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
