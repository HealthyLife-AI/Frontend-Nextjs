import { Languages, Repeat, ShieldCheck, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const REASONS: {
  icon: LucideIcon;
  titleKey: "reason1Title" | "reason2Title" | "reason3Title";
  bodyKey: "reason1Body" | "reason2Body" | "reason3Body";
}[] = [
  { icon: Languages, titleKey: "reason1Title", bodyKey: "reason1Body" },
  { icon: ShieldCheck, titleKey: "reason2Title", bodyKey: "reason2Body" },
  { icon: Repeat, titleKey: "reason3Title", bodyKey: "reason3Body" },
];

export async function WhyUsSection() {
  const t = await getTranslations("home.whyUs");

  return (
    <section id="for-specialists" className="bg-card/60 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
            <Reveal key={titleKey} delayMs={i * 100}>
              <div className="flex h-full flex-col rounded-card border border-border bg-card p-6 text-start shadow-card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{t(titleKey)}</h3>
                <p className="leading-relaxed text-ink-muted">{t(bodyKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
