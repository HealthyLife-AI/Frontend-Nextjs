"use client";

import { LayoutGrid, Users, UtensilsCrossed, Bell, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { ComponentType } from "react";
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
 * Persistent nav rail at desktop width; below `lg:` it becomes an
 * off-canvas drawer (dashboard-builder Step 1) driven by `open`/`onClose`
 * from AppShell. Fixed to the inline-start edge via logical CSS
 * (`start-0`) so it docks right in Arabic (RTL) and left in English
 * (LTR) automatically — matching the approved Stitch reference ("docked
 * to the visual right in RTL layout") without a separate mirrored layout
 * per direction. The closed-drawer transform is the one place that can't
 * use a logical property (CSS has no logical `translate`), so it's
 * spelled out per direction with `rtl:`/`ltr:` variants instead — scoped
 * under `max-lg:` rather than paired with a separate `lg:translate-x-0`
 * to cancel them. A bare `rtl:`/`ltr:` class and a `lg:` class have equal
 * specificity, so which one wins at desktop width came down to Tailwind's
 * internal stylesheet ordering, not viewport size — and it was picking
 * the closed-drawer transform, leaving the sidebar rendered but shoved
 * off-screen by its own width at every viewport, including desktop.
 * `max-lg:` removes the conflict structurally: the closed-state class
 * cannot match at `lg:` and up in the first place, so there's nothing
 * left to override there.
 *
 * Only `/dashboard` has a page behind it in Sprint 1; the other items are
 * real links to where Sprint 2/3 land their pages (patients, plans,
 * alerts, settings) — this shell is built to host them, not to fake them.
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

  const activeHref = NAV_ITEMS
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col justify-between border-e border-border bg-card p-4 transition-transform duration-200 ${
          open ? "translate-x-0" : "max-lg:rtl:translate-x-full max-lg:ltr:-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-card">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-lg font-semibold text-primary">
                {tCommon("brandName")}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          {/* Header hides its own switcher below `sm:` for space (see
              Header.tsx) — this is the mobile replacement, so locale is
              always reachable regardless of screen width. */}
          <div className="sm:hidden">
            <LocaleSwitcher />
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
              const isActive = href === activeHref;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-card"
                      : "text-ink-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                  <span>{t(labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3 rounded-control bg-canvas p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-ink">{user.name}</span>
              <span className="truncate text-xs text-ink-muted">{user.email}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
