import { Bot, Clock, Sparkles, Stethoscope, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Typewriter } from "./Typewriter";

const ITEMS: {
  icon: LucideIcon;
  titleKey: "item1Title" | "item2Title" | "item3Title";
  bodyKey: "item1Body" | "item2Body" | "item3Body";
}[] = [
  { icon: Stethoscope, titleKey: "item1Title", bodyKey: "item1Body" },
  { icon: Clock, titleKey: "item2Title", bodyKey: "item2Body" },
  { icon: Bot, titleKey: "item3Title", bodyKey: "item3Body" },
];

/**
 * The deep-teal band that used to be `SocialProofSection`. Still no
 * invented numbers (this is a pre-launch product with no pilot yet — the
 * same call the earlier section made); instead it states the three
 * commitments the product is built around, and shows one of them
 * happening: an illustrative weekly AI summary typing itself out in
 * Arabic, the way `WeeklySummaryService` writes them.
 */
export async function PrinciplesSection() {
  const t = await getTranslations("home.principles");

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-mkt-dark-bg to-mkt-night px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32">
      <div className="mkt-dots-light pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 start-[-10%] -z-10 h-[34rem] w-[34rem] rounded-full bg-mkt-glow/15 blur-3xl animate-aurora-a" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 end-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/30 blur-3xl animate-aurora-b" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} align="start" tone="dark" className="mb-10 lg:mb-12" />
          <div className="flex flex-col gap-3">
            {ITEMS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <Reveal key={titleKey} delayMs={i * 90}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur transition-colors hover:bg-white/[0.08]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mkt-glow/30 to-primary/30 text-mkt-glow ring-1 ring-white/15">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <div className="text-start">
                    <div className="font-bold">{t(titleKey)}</div>
                    <div className="text-sm text-mkt-dark-muted">{t(bodyKey)}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal variant="scale" delayMs={150}>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-mkt-glow/25 to-primary/10 blur-2xl" aria-hidden="true" />
            <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-float backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-mkt-glow">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mkt-glow/15">
                    <Sparkles size={16} strokeWidth={2} />
                  </span>
                  {t("summaryTitle")}
                </span>
                <span className="text-xs text-mkt-dark-muted">{t("summaryMeta")}</span>
              </div>
              <Typewriter
                text={t("summaryText")}
                dir="rtl"
                lang="ar"
                className="min-h-[7.5rem] text-start text-lg leading-[1.9] text-white sm:text-xl"
              />
              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-mkt-dark-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-mkt-glow" aria-hidden="true" />
                {t("summaryFootnote")}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
