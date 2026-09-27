import { Bluetooth, CalendarDays, CheckCircle2, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PatientAppPhoneMockup } from "./PatientAppPhoneMockup";
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

/**
 * The client-side of the product: a floating phone mockup flanked by
 * four feature cards at `lg`+, stacked below it on smaller screens.
 * The phone's own micro animations (water bar, rows) are driven by the
 * `Reveal` wrapping it.
 */
export async function PatientAppSection() {
  const t = await getTranslations("home.patientApp");
  const [card1, card2, card3, card4] = ITEMS;

  function renderCard({ icon: Icon, titleKey, bodyKey, statLabelKey, statValueKey }: (typeof ITEMS)[number], delayMs: number, variant: "up" | "scale" = "up") {
    return (
      <Reveal key={titleKey} delayMs={delayMs} variant={variant} className="h-full">
        <div className="group flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white p-5 text-start shadow-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-card-hover">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand transition-transform duration-500 group-hover:-rotate-6">
            <Icon size={21} strokeWidth={1.75} />
          </div>
          <h3 className="mb-1.5 text-lg font-bold text-ink">{t(titleKey)}</h3>
          <p className="mb-4 text-pretty text-sm leading-relaxed text-ink-muted">{t(bodyKey)}</p>
          <div className="mt-auto flex items-center justify-between border-t border-divider pt-3 text-sm">
            <span className="text-ink-muted">{t(statLabelKey)}</span>
            <span className="mkt-nums rounded-full bg-mkt-mint-bg px-3 py-1 text-xs font-bold text-mkt-emerald-deep ring-1 ring-mkt-mint-border">{t(statValueKey)}</span>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <section id="patient-app" className="relative scroll-mt-24 overflow-hidden bg-canvas px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />
      <div className="mkt-dots pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[40rem]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t.rich("title", {
            highlight: (chunks) => (
              <span className="bg-gradient-to-r from-mkt-emerald-deep to-mkt-mint bg-clip-text text-transparent">{chunks}</span>
            ),
          })}
          subtitle={t("subtitle")}
        />

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_20rem_1fr] lg:gap-8">
          <div className="hidden gap-5 lg:grid">
            {renderCard(card1, 0)}
            {renderCard(card2, 90)}
          </div>

          <Reveal delayMs={120} variant="scale" className="mx-auto hidden lg:block">
            <div className="animate-float-slower">
              <PatientAppPhoneMockup className="w-[19rem]" />
            </div>
          </Reveal>

          <div className="hidden gap-5 lg:grid">
            {renderCard(card3, 180)}
            {renderCard(card4, 270)}
          </div>

          <Reveal variant="scale" className="mx-auto lg:hidden">
            <PatientAppPhoneMockup className="w-72" />
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
            {ITEMS.map((item, i) => renderCard(item, i * 80))}
          </div>
        </div>

        <Reveal delayMs={300} className="mt-12 flex justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/[0.07] bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-card">
            <Bluetooth size={16} strokeWidth={2} className="text-primary" />
            {t("trustLine")}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
