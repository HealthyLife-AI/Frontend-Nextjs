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
 * The design reference's stats here were generic Stitch placeholder
 * copy (a specific headcount of "consultants", invented time-savings
 * percentages) — replaced with the qualitative claims the PRD/SRS
 * actually back (real nutritionist interviews, AI-driven proactive
 * alerts), rather than presenting unverified numbers as fact on a
 * pre-launch product's public page.
 */
export async function SocialProofSection() {
  const t = await getTranslations("home.socialProof");

  return (
    <section className="bg-ink px-4 py-14 text-card sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-start">
        {STATS.map(({ icon: Icon, valueKey, labelKey }, i) => (
          <Reveal key={valueKey} delayMs={i * 100} className="flex items-center justify-center gap-4 md:justify-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-card/10 text-accent">
              <Icon size={26} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-lg font-bold">{t(valueKey)}</div>
              <p className="mt-1 text-sm text-card/70">{t(labelKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
