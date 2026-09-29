import type { ReactNode } from "react";
import { BellRing, CalendarDays, CheckCircle2, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
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
    <section id="patient-app" className="relative scroll-mt-24 overflow-hidden bg-canvas px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
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

        <Reveal delayMs={300} className="mt-12 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/[0.07] bg-white px-5 py-2.5 text-center text-sm font-medium text-ink shadow-card">
            <BellRing size={16} strokeWidth={2} className="shrink-0 text-primary" />
            {t("trustLine")}
          </span>

          {/* The Flutter app isn't published yet, so these are labelled "soon", not linked. */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold text-ink-muted">{t("storesLabel")}</span>
            <div className="flex flex-wrap justify-center gap-3" dir="ltr">
              <StoreBadge icon={<AppleMark />} top="Download on the" name={t("appStore")} soon={t("comingSoon")} />
              <StoreBadge icon={<PlayMark />} top="GET IT ON" name={t("googlePlay")} soon={t("comingSoon")} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Store badge in the stores' own dark style, with a "soon" tag until the app is published. */
function StoreBadge({ icon, top, name, soon }: { icon: ReactNode; top: string; name: string; soon: string }) {
  return (
    <span className="relative inline-flex h-14 items-center gap-3 rounded-2xl bg-ink px-5 text-white opacity-90 shadow-card" aria-label={`${name} — ${soon}`}>
      <span className="h-7 w-7 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col text-start leading-tight" aria-hidden="true">
        <span className="text-[10px] font-medium tracking-wide text-white/70">{top}</span>
        <span className="text-lg font-semibold">{name}</span>
      </span>
      <span className="absolute -top-2 -end-2 rounded-full bg-mkt-mint px-2 py-0.5 text-[10px] font-bold text-mkt-teal-deep shadow-sm" aria-hidden="true">
        {soon}
      </span>
    </span>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M16.37 12.62c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.19-1.72-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.67-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.31-.89-2.33-3.53ZM14.18 6.13c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.69-.93 2.69.98.08 1.98-.5 2.59-1.23Z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <path d="M4.2 2.6 13.9 12l-9.7 9.4c-.3-.2-.5-.6-.5-1V3.6c0-.4.2-.8.5-1Z" fill="#34d399" />
      <path d="m17.2 8.8-3.3 3.2-9.7-9.4c.3-.2.8-.2 1.2 0l11.8 6.2Z" fill="#60a5fa" />
      <path d="m17.2 15.2-11.8 6.2c-.4.2-.9.2-1.2 0l9.7-9.4 3.3 3.2Z" fill="#f87171" />
      <path d="m20.4 13.5-3.2 1.7-3.3-3.2 3.3-3.2 3.2 1.7c.9.5.9 2.5 0 3Z" fill="#fbbf24" />
    </svg>
  );
}
