import { Bot, Clock, Stethoscope, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";

const STATS: {
  icon: LucideIcon;
  valueKey: "stat1Value" | "stat2Value" | "stat3Value";
  labelKey: "stat1Label" | "stat2Label" | "stat3Label";
}[] = [
  { icon: Stethoscope, valueKey: "stat1Value", labelKey: "stat1Label" },
  { icon: Clock, valueKey: "stat2Value", labelKey: "stat2Label" },
  { icon: Bot, valueKey: "stat3Value", labelKey: "stat3Label" },
];

/**
 * The Figma reference's stats here (y 4265-4315 of `Desktop - 1.svg`)
 * were placeholder-precise — a specific "3 consultants" headcount,
 * invented time-savings — replaced with the qualitative claims the
 * PRD/SRS actually back (real nutritionist interviews, AI-driven
 * proactive alerts), rather than presenting unverified numbers as fact
 * on a pre-launch product's public page.
 *
 * Sits directly below `WhyHealthyLifeSection` and above `FaqSection`
 * here, matching the Figma file's own order — it used to render after
 * the FAQ instead.
 */
export async function SocialProofSection() {
  const t = await getTranslations("home.socialProof");

  return (
    <section className="bg-mkt-dark-bg px-4 py-14 text-card sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-start">
        {STATS.map(({ icon: Icon, valueKey, labelKey }, i) => (
          <Reveal key={valueKey} delayMs={i * 100} className="flex items-center justify-center gap-4 md:justify-start">
            <div>
              <div className="text-lg font-bold">{t(valueKey)}</div>
              <p className="mt-1 text-sm text-mkt-dark-muted">{t(labelKey)}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-mkt-mint/10 text-mkt-mint">
              <Icon size={26} strokeWidth={1.75} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
