"use client";

import { LayoutGrid, Users, UtensilsCrossed, Bell, Settings, X, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AuthUser } from "@/lib/auth/types";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavItem = {
  href: string;
  labelKey: "dashboard" | "patients" | "plans" | "alerts" | "settings";
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutGrid },
  { href: "/dashboard/patients", labelKey: "patients", icon: Users },
  { href: "/dashboard/plans", labelKey: "plans", icon: UtensilsCrossed },
  { href: "/dashboard/alerts", labelKey: "alerts", icon: Bell },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
];

/**
 * Persistent nav rail at desktop width; below `lg:` an off-canvas drawer
 * driven by `open`/`onClose` from AppShell. Docked to the inline-start
 * edge via logical `start-0` (right in Arabic, left in English).
 *
 * Visual language follows the marketing page: the real HealthyLife logo
 * (`/home/logo.png`, the Figma frame's own asset) instead of an icon +
 * text wordmark, the landing CTA's teal gradient for the active item, and
 * mint-tint hovers.
 *
 * The closed-drawer transform can't use a logical property (CSS has no
 * logical `translate`), so it's spelled out per direction — scoped under
 * `max-lg:` so it structurally can't match at desktop width, where a bare
 * `rtl:`/`ltr:` class used to win over `lg:translate-x-0` by stylesheet
 * order and push the rail off-screen.
 */
export function Sidebar({
  user,
  open,
  onClose,
}: {
  user: AuthUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const activeHref = NAV_ITEMS
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-border/70 bg-card transition-transform duration-300 ${
          open ? "translate-x-0" : "max-lg:rtl:translate-x-full max-lg:ltr:-translate-x-full"
        }`}
      >
        {/* Soft brand wash behind the logo — the landing page's mint blobs, scaled down. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-mkt-mint-bg to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, fixed-aspect wordmark */}
            <img src="/home/logo.png" alt={tCommon("brandFull")} className="h-14 w-auto" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-field text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative flex flex-1 flex-col gap-2 overflow-y-auto px-4">
          <span className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted/70">
            {t("menu")}
          </span>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
              const isActive = href === activeHref;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex h-12 items-center gap-3 rounded-field px-3.5 text-[15px] font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand"
                      : "text-ink-muted hover:bg-mkt-mint-bg hover:text-mkt-teal-deep"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors ${
                      isActive ? "bg-white/15" : "bg-canvas group-hover:bg-white"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <span>{t(labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header hides its switcher below `sm:` — this keeps locale reachable on phones. */}
          <div className="mt-4 px-3 sm:hidden">
            <LocaleSwitcher />
          </div>
        </div>

        {user && (
          <div className="relative p-4">
            <span className="mb-2 block px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted/70">
              {t("account")}
            </span>
            <div className="flex items-center gap-3 rounded-panel border border-border/70 bg-gradient-to-br from-card to-mkt-mint-bg p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-mkt-teal-deep text-sm font-bold text-white shadow-brand">
                {user.name.replace(/^د\.\s*/, "").charAt(0)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold text-ink">{user.name}</span>
                <span className="truncate text-xs text-ink-muted" dir="ltr">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field text-ink-muted transition-colors hover:bg-status-late-bg hover:text-status-late"
                aria-label={t("signOut")}
                title={t("signOut")}
              >
                <LogOut size={17} strokeWidth={1.9} className="rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
