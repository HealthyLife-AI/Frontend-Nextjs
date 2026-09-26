"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SECTION_LINKS = [
  { href: "#how-it-works", key: "howItWorks" as const },
  { href: "#for-specialists", key: "forSpecialists" as const },
  { href: "#patient-app", key: "patientApp" as const },
  { href: "#book-demo", key: "contact" as const },
];

/**
 * Marketing nav, matched to the Figma header (`Desktop - 1.svg`,
 * y 18-100): transparent over the hero photo, inside the same 1210px
 * content box — logo at the inline-start edge (164x82, `logo.png` is the
 * frame's own `image2_49_3`), links in
 * the middle, "sign in" outline + "start free" filled buttons (117x48 /
 * 133x48, 15px radius, `--color-primary`) at the inline-end edge.
 *
 * Figma draws both "الرئيسة" and "كيف يعمل" in the active style; only the
 * current-page link ("home") gets it here — two simultaneously "active"
 * links in a live nav would read as a bug.
 *
 * Stays fixed so the nav is reachable anywhere on this long page: once
 * scrolled past the top it gains a solid backdrop, since transparent
 * text over later sections wouldn't be legible. The locale switcher
 * (absent from the Figma header) lives in `HomeFooter` instead.
 */
export function HomeHeader() {
  const t = useTranslations("home.nav");
  const tCommon = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-4 transition-[background-color,box-shadow,height] duration-300 sm:px-6 lg:px-0 ${
        scrolled
          ? "h-20 bg-white/90 shadow-[0_8px_24px_-12px_rgba(11,46,48,0.12)] backdrop-blur-md"
          : "h-20 bg-transparent lg:h-[120px]"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1210px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, not a next/image candidate (fixed aspect wordmark, no responsive srcset needed) */}
          <img
            src="/home/logo.png"
            alt={tCommon("brandName")}
            className={`w-auto transition-[height] duration-300 ${scrolled ? "h-14" : "h-14 lg:h-[82px]"}`}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <a href="#" className="text-base font-bold text-mkt-nav-active">
            {t("home")}
          </a>
          {SECTION_LINKS.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="text-base font-medium text-mkt-body transition-colors hover:text-mkt-nav-active"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-[15px] border border-primary px-4 text-sm text-[#47617c] transition-colors hover:bg-primary/5 lg:h-12 lg:w-[117px] lg:justify-center"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-[15px] bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover lg:h-12 lg:w-[133px] lg:justify-center"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
