import Image from "next/image";
import { ArrowUpRight, BadgeCheck, CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";

/**
 * Closing CTA over the designer's nutritionist photograph (`cta-bg.webp`,
 * restored at the user's request), with the redesign's motion kept: a
 * drifting aurora tint and staggered reveals.
 *
 * The photo carries printed English labels, so it is never mirrored; the
 * copy therefore sits in a column pinned to the *physical* right
 * (`lg:ml-auto`, deliberately not a logical property — the photo's empty
 * half is on the right in both locales), showing the photo on the left.
 * Below `lg` the photo slides under the copy and a white scrim keeps it
 * legible.
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
    <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden bg-canvas lg:min-h-[640px]">
      <Image src="/home/cta-bg.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-left-top lg:object-top" />
      <div className="absolute inset-0 -z-10 bg-white/75 lg:hidden" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden bg-gradient-to-l from-canvas/90 via-canvas/40 to-transparent lg:block" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 right-[-8%] -z-10 h-[30rem] w-[30rem] rounded-full bg-mkt-glow/25 blur-3xl mix-blend-multiply animate-aurora-b" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="text-start lg:ml-auto lg:w-[560px]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-mkt-mint-border bg-white/80 px-4 py-1.5 text-sm font-semibold text-mkt-emerald-deep backdrop-blur">
              <BadgeCheck size={15} strokeWidth={2} />
              {t("badge")}
            </span>
          </Reveal>

          <Reveal delayMs={80}>
            <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.2] text-ink sm:text-4xl lg:text-[46px] lg:leading-[1.15] ltr:tracking-tight">
              {t("title")}
            </h2>
          </Reveal>

          <Reveal delayMs={160}>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-mkt-body sm:text-xl">{t("subtitle")}</p>
          </Reveal>

          <Reveal delayMs={240} className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="group relative inline-flex h-13 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-primary to-mkt-teal-deep px-8 text-base font-bold text-white shadow-brand transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(0,101,114,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100" aria-hidden="true" />
              {t("primary")}
              <ArrowUpRight size={18} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(t("secondary"))}`}
              className="inline-flex h-13 items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-7 text-base font-semibold text-mkt-teal-deep backdrop-blur transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <CalendarDays size={18} strokeWidth={1.9} />
              {t("secondary")}
            </a>
          </Reveal>

          <Reveal delayMs={320}>
            <p className="mt-5 text-sm text-ink-muted">{t("note")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
