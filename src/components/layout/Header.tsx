"use client";

import { Bell, Calendar, LogOut, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { logout } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border bg-card/90 px-4 backdrop-blur-sm sm:px-6 lg:start-64">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <div className="relative hidden w-full max-w-sm items-center md:flex">
          <Search size={18} className="pointer-events-none absolute start-3 text-ink-muted" />
          <input
            type="search"
            placeholder={t("search")}
            className="h-10 w-full rounded-control border border-border bg-canvas ps-10 pe-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-canvas hover:text-ink sm:flex"
          aria-label="Calendar"
        >
          <Calendar size={20} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label={t("alerts")}
        >
          <Bell size={20} strokeWidth={1.75} />
        </button>

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
