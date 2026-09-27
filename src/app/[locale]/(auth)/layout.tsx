import Image from "next/image";
import { BellRing, Languages, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const SHOWCASE_POINTS: { icon: LucideIcon; key: "point1" | "point2" | "point3" }[] = [
  { icon: Users, key: "point1" },
  { icon: ShieldCheck, key: "point2" },
  { icon: Languages, key: "point3" },
];

/**
 * Split-screen auth shell (login, register, forgot/reset password all
 * mount here), in the landing page's identity.
 *
 * Form side: a frosted panel on the canvas with the aurora drifting
 * behind it, the real logo above and the locale switcher in the corner.
 *
 * Brand side (`lg`+ only — on a phone the form is what a returning user
 * needs first): the landing CTA's nutritionist photo under a deep-teal
 * gradient, the same drifting aurora, and two floating product cards
 * (an adherence alert, a weekly AI summary) that show what the account
 * unlocks, above the value points. Copy comes from real PRD facts.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  const tShowcase = await getTranslations("auth.showcase");

  return (
    <div className="relative flex min-h-screen bg-canvas">
      {/* Aurora behind the whole shell (multiplies onto the photo on the brand side too). */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 start-[-10%] h-[36rem] w-[36rem] rounded-full bg-mkt-glow/30 blur-3xl animate-aurora-a" />
        <div className="absolute bottom-[-10rem] end-[-8%] h-[32rem] w-[32rem] rounded-full bg-mkt-sky/50 blur-3xl animate-aurora-b" />
      </div>
      <div className="mkt-dots pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      {/* Form side */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-10">
          <Link href="/" className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <Image src="/home/logo.png" alt={t("brandFull")} width={144} height={72} loading="eager" fetchPriority="high" className="h-auto w-32 sm:w-36" />
          </Link>
          <LocaleSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-14 pt-2 sm:px-8">
          <div className="animate-page-in w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/85 p-7 shadow-panel ring-1 ring-ink/[0.05] backdrop-blur-xl sm:p-10">
            {children}
          </div>
        </div>
      </div>

      {/* Brand side */}
      <aside className="relative isolate m-3 hidden w-[46%] max-w-[44rem] shrink-0 overflow-hidden rounded-[32px] text-white lg:flex lg:flex-col lg:justify-end lg:p-10">
        <Image src="/home/cta-bg.webp" alt="" fill sizes="46vw" className="-z-30 object-cover object-[20%_center]" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-t from-mkt-night via-mkt-dark-bg/85 to-mkt-teal-deep/20" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mix-blend-screen" aria-hidden="true">
          <div className="absolute -top-20 end-[-20%] h-[30rem] w-[30rem] rounded-full bg-mkt-glow/25 blur-3xl animate-aurora-c" />
        </div>
        <div className="mkt-dots-light pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />

        {/* Floating product cards */}
        <div className="pointer-events-none absolute end-8 top-10 flex w-[19rem] flex-col gap-3 xl:end-12 xl:top-14" aria-hidden="true">
          <div className="animate-float-slow flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-float backdrop-blur-xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-attention-bg text-status-attention">
              <BellRing size={18} strokeWidth={1.9} />
            </span>
            <div className="min-w-0 text-start">
              <div className="text-[13px] font-bold">{tShowcase("cardAlertTitle")}</div>
              <div className="truncate text-xs text-white/70">{tShowcase("cardAlertBody")}</div>
            </div>
          </div>
          <div className="animate-float-slower ms-8 rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-float backdrop-blur-xl">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-mkt-glow">
              <Sparkles size={13} strokeWidth={2} />
              {tShowcase("cardSummaryTitle")}
            </div>
            <p className="text-start text-[13px] leading-relaxed text-white/85">{tShowcase("cardSummaryBody")}</p>
          </div>
        </div>

        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mkt-glow animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mkt-glow" />
              </span>
              {t("brandFull")}
            </span>
            <h2 className="text-balance text-[30px] font-extrabold leading-[1.25] ltr:tracking-tight">{tShowcase("headline")}</h2>
            <p className="text-pretty text-[15px] leading-relaxed text-white/75">{tShowcase("body")}</p>
          </div>

          <div className="flex flex-col gap-4 rounded-[22px] border border-white/15 bg-white/[0.08] p-5 backdrop-blur-md">
            {SHOWCASE_POINTS.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-mkt-glow ring-1 ring-white/15">
                  <Icon size={19} strokeWidth={1.9} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">{tShowcase(`${key}Title`)}</span>
                  <span className="text-sm text-white/70">{tShowcase(`${key}Body`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
