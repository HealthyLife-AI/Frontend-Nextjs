import { CalendarDays, CheckCircle2, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS: {
  icon: LucideIcon;
  titleKey: "item1Title" | "item2Title" | "item3Title" | "item4Title";
  bodyKey: "item1Body" | "item2Body" | "item3Body" | "item4Body";
  statLabelKey: "item1StatLabel" | "item2StatLabel" | "item3StatLabel" | "item4StatLabel";
  statValueKey: "item1StatValue" | "item2StatValue" | "item3StatValue" | "item4StatValue";
}[] = [
  { icon: CalendarDays, titleKey: "item1Title", bodyKey: "item1Body", statLabelKey: "item1StatLabel", statValueKey: "item1StatValue" },
  { icon: CheckCircle2, titleKey: "item2Title", bodyKey: "item2Body", statLabelKey: "item2StatLabel", statValueKey: "item2StatValue" },
  { icon: TrendingUp, titleKey: "item3Title", bodyKey: "item3Body", statLabelKey: "item3StatLabel", statValueKey: "item3StatValue" },
  { icon: ShoppingCart, titleKey: "item4Title", bodyKey: "item4Body", statLabelKey: "item4StatLabel", statValueKey: "item4StatValue" },
];

export async function PatientAppSection() {
  const t = await getTranslations("home.patientApp");

  return (
    <section id="patient-app" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, titleKey, bodyKey, statLabelKey, statValueKey }, i) => (
            <Reveal key={titleKey} delayMs={i * 80}>
              <div className="flex h-full flex-col rounded-card border border-border bg-card p-5 text-start shadow-card transition-shadow hover:shadow-card-hover">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Icon size={21} strokeWidth={1.75} />
                </div>
                <h3 className="mb-1 font-semibold text-ink">{t(titleKey)}</h3>
                <p className="mb-4 text-sm leading-relaxed text-ink-muted">{t(bodyKey)}</p>
                <div className="mt-auto flex items-center justify-between rounded-control bg-canvas px-3 py-2 text-sm">
                  <span className="text-ink-muted">{t(statLabelKey)}</span>
                  <span className="font-bold text-accent-active">{t(statValueKey)}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
