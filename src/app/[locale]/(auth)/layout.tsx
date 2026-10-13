import Image from "next/image";
import { BellRing, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * Auth shell (login, register, forgot/reset password all mount here): one
 * centered card holding both halves, so the form and the brand image read
 * as a single surface instead of two separate blocks.
 *
 * Form half: logo and locale switcher on top, the form centered below.
 * Brand half (`lg`+ only, inset inside the card): the nutritionist photo
 * under a deep-teal gradient, two floating product cards that show what
 * the account unlocks, and one headline. Kept sparse on purpose: the
 * value points live on the landing page.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  const tShowcase = await getTranslations("auth.showcase");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-3 py-6 sm:px-6 lg:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 start-[-10%] h-[36rem] w-[36rem] rounded-full bg-mkt-glow/30 blur-3xl animate-aurora-a" />
        <div className="absolute bottom-[-10rem] end-[-8%] h-[32rem] w-[32rem] rounded-full bg-mkt-sky/50 blur-3xl animate-aurora-b" />
      </div>
      <div className="mkt-dots pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <div className="animate-page-in grid w-full max-w-[1140px] overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-2.5 shadow-float ring-1 ring-ink/[0.05] backdrop-blur-xl lg:min-h-[680px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)]">
        {/* Form half */}
        <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <Image src="/home/logo.png" alt={t("brandFull")} width={144} height={72} loading="eager" fetchPriority="high" className="h-auto w-28 sm:w-32" />
            </Link>
            <LocaleSwitcher />
          </div>

          <div className="flex flex-1 items-center justify-center py-8 lg:py-10">
            <div className="w-full max-w-[400px]">{children}</div>
          </div>

          <p className="text-center text-xs text-ink-muted/80">© {new Date().getFullYear()} {t("brandFull")}</p>
        </div>

        {/* Brand half */}
        <aside className="relative isolate hidden overflow-hidden rounded-[24px] text-white lg:flex lg:flex-col lg:justify-between lg:p-9">
          <Image src="/home/cta-bg.webp" alt="" fill sizes="(min-width: 1140px) 580px, 50vw" className="-z-30 object-cover object-[22%_center]" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-t from-mkt-night via-mkt-dark-bg/80 to-mkt-teal-deep/40" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mix-blend-screen" aria-hidden="true">
            <div className="absolute -top-24 end-[-25%] h-[26rem] w-[26rem] rounded-full bg-mkt-glow/25 blur-3xl animate-aurora-c" />
          </div>
          <div className="mkt-dots-light pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mkt-glow animate-pulse-ring" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mkt-glow" />
            </span>
            {t("brandFull")}
          </span>

          {/* Floating product cards: physically right in both directions, the photo's face is on the left. */}
          <div className="pointer-events-none flex w-[18.5rem] flex-col gap-3 ltr:self-end rtl:self-start" aria-hidden="true">
            <div className="animate-float-slow flex items-center gap-3 rounded-2xl border border-white/20 bg-white/12 p-3 shadow-float backdrop-blur-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-attention-bg text-status-attention">
                <BellRing size={18} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 text-start">
                <div className="text-[13px] font-bold">{tShowcase("cardAlertTitle")}</div>
                <div className="truncate text-xs text-white/70">{tShowcase("cardAlertBody")}</div>
              </div>
            </div>
            <div className="animate-float-slower me-8 rounded-2xl border border-white/20 bg-white/12 p-3.5 shadow-float backdrop-blur-xl">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-mkt-glow">
                <Sparkles size={13} strokeWidth={2} />
                {tShowcase("cardSummaryTitle")}
              </div>
              <p className="text-start text-[13px] leading-relaxed text-white/85">{tShowcase("cardSummaryBody")}</p>
            </div>
          </div>

          <div className="flex max-w-[30rem] flex-col gap-3">
            <h2 className="text-balance text-[30px] font-extrabold leading-[1.25] ltr:tracking-tight">{tShowcase("headline")}</h2>
            <p className="text-pretty text-[15px] leading-relaxed text-white/75">{tShowcase("body")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
