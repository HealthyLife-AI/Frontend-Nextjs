import { ArrowUpRight, BadgeCheck, CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";

/**
 * Closing CTA on the deep-teal night palette: aurora glow, a faint dot
 * grid, and concentric orbit rings with a light travelling around them
 * — the one purely decorative animation on the page, placed where the
 * copy is short enough to carry it.
 *
 * Two actions, both honest about what exists: "Start free" goes to the
 * real sign-up; "Book a demo" opens an email to the published contact
 * address, since there is no booking flow in the MVP.
 */
export async function CtaSection() {
  const t = await getTranslations("home.cta");
  const tFooter = await getTranslations("home.footer");
  const email = tFooter("email");

  return (
    <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden bg-mkt-night px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-40">
      <div className="mkt-dots-light pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl animate-aurora-c" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 start-[10%] -z-10 h-[24rem] w-[24rem] rounded-full bg-mkt-glow/20 blur-3xl animate-aurora-b" aria-hidden="true" />

      {/* Orbit rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        {[26, 38, 50].map((size, i) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07] animate-orbit"
            style={{ width: `${size}rem`, height: `${size}rem`, animationDuration: `${18 + i * 8}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mkt-glow shadow-[0_0_18px_4px_rgba(94,234,212,0.6)]" />
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-sm font-semibold text-mkt-glow backdrop-blur">
            <BadgeCheck size={15} strokeWidth={2} />
            {t("badge")}
          </span>
        </Reveal>

        <Reveal delayMs={80}>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-[56px] lg:leading-[1.1] ltr:tracking-tight">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal delayMs={160}>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-mkt-dark-muted sm:text-xl">{t("subtitle")}</p>
        </Reveal>

        <Reveal delayMs={240} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group relative inline-flex h-13 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-mkt-glow to-accent px-8 text-base font-bold text-mkt-night shadow-[0_18px_40px_-14px_rgba(94,234,212,0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-14px_rgba(94,234,212,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mkt-glow focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-night"
          >
            <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100" aria-hidden="true" />
            {t("primary")}
            <ArrowUpRight size={18} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
          </Link>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(t("secondary"))}`}
            className="inline-flex h-13 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-7 text-base font-semibold text-white backdrop-blur transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-night"
          >
            <CalendarDays size={18} strokeWidth={1.9} />
            {t("secondary")}
          </a>
        </Reveal>

        <Reveal delayMs={320}>
          <p className="mt-6 text-sm text-mkt-dark-muted/80">{t("note")}</p>
        </Reveal>
      </div>
    </section>
  );
}
