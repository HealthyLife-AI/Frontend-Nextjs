"use client";

import { UserRound, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Button } from "@/components/ui/Button";

const SECTION_LINKS = [
  { href: "#how-it-works", key: "howItWorks" as const },
  { href: "#for-specialists", key: "forSpecialists" as const },
  { href: "#patient-app", key: "patientApp" as const },
  { href: "#faq", key: "contact" as const },
];

/**
 * Sticky marketing nav, distinct from the dashboard's Header.tsx — this
 * one links to in-page sections (the homepage is a single scroll, not a
 * set of routes) and its own CTA goes to registration, since there's no
 * real demo-booking flow behind this MVP (BR-6/positioning: never
 * promise a capability that isn't actually there).
 */
export function HomeHeader() {
  const t = useTranslations("home.nav");
  const tCommon = useTranslations("common");

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-border/60 bg-canvas/85 px-4 shadow-[0_1px_0_rgba(11,46,48,0.03),0_8px_24px_-12px_rgba(11,46,48,0.08)] backdrop-blur-md sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-control bg-gradient-to-br from-primary to-ink text-card">
          <UtensilsCrossed size={19} strokeWidth={1.75} />
        </div>
        <span className="text-lg font-semibold text-primary">{tCommon("brandName")}</span>
      </Link>

      <nav className="hidden items-center gap-1 lg:flex">
        <a
          href="#"
          className="rounded-control bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
        >
          {t("home")}
        </a>
        {SECTION_LINKS.map(({ href, key }) => (
          <a
            key={key}
            href={href}
            className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-card hover:text-ink"
          >
            {t(key)}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>

        <Link href="/login">
          <Button variant="ghost" className="!h-9 !px-3">
            <span className="hidden sm:inline">{t("signIn")}</span>
            <UserRound size={18} strokeWidth={1.75} className="sm:hidden" />
          </Button>
        </Link>

        <a href="#book-demo">
          <Button className="!h-9">{t("cta")}</Button>
        </a>
      </div>
    </header>
  );
}
