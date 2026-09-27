"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SECTION_LINKS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "why", key: "why" },
  { id: "patient-app", key: "patientApp" },
  { id: "faq", key: "faq" },
  { id: "contact", key: "contact" },
] as const;

/**
 * Marketing nav. Sits transparent over the hero, then — once the page
 * scrolls — condenses into a floating frosted bar (the Linear/Vercel
 * "glass pill" pattern) with a hairline reading progress indicator
 * along its top edge. Section links are scroll-spied so the current
 * section is always highlighted; the highlight pill slides between
 * links via a plain color transition rather than a shared-layout
 * animation, which keeps it cheap.
 *
 * Below `lg` the links live in a sheet that drops from under the bar.
 * While it's open the page doesn't scroll behind it and Escape closes
 * it. The locale switcher lives in `HomeFooter`.
 */
export function HomeHeader() {
  const t = useTranslations("home.nav");
  const tCommon = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(window.scrollY > 16);
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = SECTION_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The section occupying the band just below the header wins.
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
        else if (window.scrollY < 200) setActive(null);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const condensed = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5">
      <div
        className={`mx-auto transition-[max-width,margin,background-color,box-shadow,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          condensed
            ? "mt-3 max-w-6xl rounded-2xl border border-white/70 bg-white/80 shadow-[0_12px_40px_-16px_rgba(11,46,48,0.25)] backdrop-blur-xl lg:rounded-full"
            : "mt-0 max-w-7xl border border-transparent bg-transparent"
        }`}
      >
        {/* Reading progress along the top edge of the floating bar. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-6 top-0 h-px origin-left bg-gradient-to-r from-primary via-accent to-mkt-glow transition-opacity duration-300 rtl:origin-right ${
            condensed ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: `scaleX(${progress})` } as CSSProperties}
        />

        <div className={`flex items-center justify-between gap-4 px-3 transition-[height] duration-500 sm:px-5 ${condensed ? "h-16" : "h-20 lg:h-24"}`}>
          <Link href="/" className="flex shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <Image
              src="/home/logo.png"
              alt={tCommon("brandFull")}
              width={144}
              height={72}
              loading="eager"
              fetchPriority="high"
              className={`h-auto transition-[width] duration-500 ${condensed ? "w-28" : "w-32 lg:w-36"}`}
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("home")}>
            {SECTION_LINKS.map(({ id, key }) => {
              const isActive = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors duration-300 ${
                    isActive ? "bg-mkt-teal-deep/[0.08] text-mkt-teal-deep" : "text-mkt-nav-muted hover:bg-ink/[0.04] hover:text-mkt-teal-deep"
                  }`}
                >
                  {t(key)}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-mkt-teal-deep transition-colors hover:bg-mkt-teal-deep/[0.08] sm:inline-flex"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="group relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-br from-primary to-mkt-teal-deep px-4 text-sm font-bold text-white shadow-brand transition-[transform,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[0_14px_28px_-12px_rgba(0,101,114,0.6)] active:translate-y-0 sm:px-5"
            >
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity group-hover:animate-shimmer group-hover:opacity-100" aria-hidden="true" />
              {t("cta")}
              <ArrowUpRight size={16} strokeWidth={2} className="rtl:-scale-x-100" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="home-mobile-nav"
              aria-label={open ? t("menuClose") : t("menuOpen")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.05] lg:hidden"
            >
              {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Mobile sheet — grid-rows trick animates height without JS measuring. */}
        <div
          id="home-mobile-nav"
          className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <nav className="flex flex-col gap-1 border-t border-divider px-3 pb-4 pt-3" aria-label={t("home")}>
              {SECTION_LINKS.map(({ id, key }, i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
                  className={`rounded-xl px-4 py-3 text-base font-semibold text-ink transition-[opacity,transform,background-color] duration-400 hover:bg-mkt-mint-bg ${
                    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  {t(key)}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-mkt-teal-deep sm:hidden"
              >
                {t("signIn")}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
