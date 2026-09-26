import { CalendarDays, CheckCircle2, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
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
 * The Figma reference gives this section an actual phone mockup flanked
 * by feature cards, not just a bare icon grid — `PatientAppPhoneMockup`
 * reproduces that mockup's real content (streak, water tracker, meal
 * schedule), distinct from the simpler checklist card `Hero.tsx` shows
 * (the Figma hero has no phone mockup at all, so there's nothing to
 * match there).
 *
 * The title's second clause is a teal→mint gradient in the reference
 * (measured off the SVG: the highlighted glyphs sample across the
 * `mkt-emerald-deep`…`mkt-mint` range, not one flat color) — matching
 * `--color-mkt-emerald-deep`'s own globals.css comment, "gradient
 * heading start".
 */
export async function PatientAppSection() {
  const t = await getTranslations("home.patientApp");
  const [card1, card2, card3, card4] = ITEMS;

  function renderCard({ icon: Icon, titleKey, bodyKey, statLabelKey, statValueKey }: (typeof ITEMS)[number], delayMs: number) {
    return (
      <Reveal key={titleKey} delayMs={delayMs}>
        <div className="flex h-full flex-col rounded-card border border-border bg-card p-5 text-start shadow-card transition-shadow hover:shadow-card-hover">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-control bg-mkt-teal-deep text-card">
            <Icon size={21} strokeWidth={1.75} />
          </div>
          <h3 className="mb-1 font-semibold text-ink">{t(titleKey)}</h3>
          <p className="mb-4 text-sm leading-relaxed text-mkt-slate">{t(bodyKey)}</p>
          <div className="mt-auto flex items-center justify-between border-t border-divider pt-3 text-sm">
            <span className="text-mkt-slate">{t(statLabelKey)}</span>
            <span className="rounded-control bg-mkt-teal-deep px-3 py-1.5 text-xs font-semibold text-card">
              {t(statValueKey)}
            </span>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <section
      id="patient-app"
      className="bg-gradient-to-b from-[#f4faf9] via-canvas to-[#f0f9f8] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t.rich("title", {
            highlight: (chunks) => (
              <span className="bg-gradient-to-r from-mkt-emerald-deep to-mkt-mint bg-clip-text text-transparent">
                {chunks}
              </span>
            ),
          })}
          subtitle={t("subtitle")}
          pill
        />

        {/* `lg`+: phone flanked by two cards on each side, matching the Figma
            reference. Below `lg` there's no room for that split, so it
            collapses to the mockup on top and a plain 2-col card grid. */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_19rem_1fr]">
          <div className="hidden gap-5 lg:grid">
            {renderCard(card1, 0)}
            {renderCard(card2, 80)}
          </div>

          <Reveal delayMs={160} className="mx-auto hidden lg:block">
            <PatientAppPhoneMockup className="w-72" />
          </Reveal>

          <div className="hidden gap-5 lg:grid">
            {renderCard(card3, 240)}
            {renderCard(card4, 320)}
          </div>

          <Reveal className="mx-auto lg:hidden">
            <PatientAppPhoneMockup className="w-72" />
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
            {ITEMS.map((item, i) => renderCard(item, i * 80))}
          </div>
        </div>

        <Reveal delayMs={400} className="mt-10 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mkt-teal-cta px-5 py-2.5 text-sm text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t("trustLine")}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
