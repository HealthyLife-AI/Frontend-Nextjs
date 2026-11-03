import type { CSSProperties } from "react";
import {
  CalendarClock,
  ClipboardCheck,
  Leaf,
  ListChecks,
  MessageSquareText,
  MoonStar,
  Newspaper,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SpotlightGrid } from "./SpotlightGrid";

type ItemNumber = 1 | 2 | 3 | 4 | 5 | 6;

const ITEMS: { icon: LucideIcon; n: ItemNumber }[] = [
  { icon: CalendarClock, n: 1 },
  { icon: MessageSquareText, n: 2 },
  { icon: ListChecks, n: 3 },
  { icon: ClipboardCheck, n: 4 },
  { icon: MoonStar, n: 5 },
  { icon: Ruler, n: 6 },
];

/**
 * The follow-up loop between sessions, which the product grew after the
 * first landing page was written: appointments (patient booking on the
 * nutritionist's availability, the 12-hour change cutoff), quick
 * requests, session reviews with tasks, health-record proposals the
 * nutritionist approves, periodic check-ins with sleep/mood, and the
 * measurement schedule. Each card's chips are the product's own labels
 * (request reasons, review ratings, intervals).
 *
 * The wide closing card shows the morning message as the patient gets
 * it: the 07:30 push and the reminder lines `TodaySummary` writes,
 * word for word in Arabic. Medical reports are left out while
 * MEDICAL_REPORTS_ENABLED is off by default.
 */
export async function BetweenVisitsSection() {
  const t = await getTranslations("home.betweenVisits");

  return (
    <section id="between-visits" className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />

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

        {/* Below `sm` the six cards are a swipeable row (the next card peeks in) instead of
            six full-width cards stacked — the section would otherwise add ~1,300px of phone scroll. */}
        <SpotlightGrid className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {ITEMS.map(({ icon: Icon, n }, i) => (
            <Reveal key={n} delayMs={(i % 3) * 80} variant="scale" threshold={0.05} className="h-auto w-[82%] shrink-0 snap-start sm:h-full sm:w-auto">
              <article className="mkt-spot flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white p-5 text-start shadow-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-card-hover sm:p-6">
                <div className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand">
                    <Icon size={21} strokeWidth={1.75} />
                  </span>
                  <h3 className="text-lg font-bold leading-snug text-ink">{t(`item${n}Title`)}</h3>
                </div>
                <p className="relative mt-3 text-pretty text-sm leading-relaxed text-ink-muted">{t(`item${n}Body`)}</p>
                <div className="relative mt-auto flex flex-wrap gap-1.5 pt-4">
                  {(t.raw(`item${n}Chips`) as string[]).map((chip, c) => (
                    <span
                      key={chip}
                      className="mkt-rise mkt-nums rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-2.5 py-1 text-xs font-semibold text-mkt-emerald-deep"
                      style={{ "--i": c + 1 } as CSSProperties}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </SpotlightGrid>

        <SpotlightGrid className="mt-5">
          <Reveal variant="scale">
            <MorningCard />
          </Reveal>
        </SpotlightGrid>
      </div>
    </section>
  );
}

async function MorningCard() {
  const t = await getTranslations("home.betweenVisits");
  const lines = t.raw("morningLines") as string[];

  return (
    <article className="mkt-spot relative grid items-center gap-8 overflow-hidden rounded-3xl border border-mkt-mint-border bg-gradient-to-br from-mkt-mint-bg via-white to-mkt-sky/25 p-6 text-start shadow-card sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
      <div className="mkt-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      <div className="relative">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mkt-mint to-mkt-emerald-deep text-white shadow-brand">
          <Newspaper size={21} strokeWidth={1.75} />
        </span>
        <h3 className="mt-4 text-balance text-xl font-bold leading-snug text-ink sm:text-2xl">{t("morningTitle")}</h3>
        <p className="mt-2 max-w-xl text-pretty leading-relaxed text-ink-muted">{t("morningBody")}</p>
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-3">
        {/* The 07:30 push, as the phone shows it. */}
        <div className="mkt-rise rounded-2xl bg-white/90 p-3.5 shadow-card ring-1 ring-ink/[0.06] backdrop-blur" style={{ "--i": 0 } as CSSProperties}>
          <div className="flex items-center gap-2 text-[11px] text-ink-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-primary to-mkt-teal-deep text-white">
              <Leaf size={11} strokeWidth={2.2} />
            </span>
            <span className="font-semibold text-ink">{t("morningApp")}</span>
            <span aria-hidden="true">·</span>
            <span className="mkt-nums">{t("morningTime")}</span>
          </div>
          <div className="mt-1.5 text-sm font-bold text-ink">{t("morningPush")}</div>
        </div>

        {/* The day's reminder lines, worded as the app words them. */}
        <div className="mkt-rise rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink/[0.06]" style={{ "--i": 1 } as CSSProperties}>
          <div className="mb-2.5 text-xs font-bold text-mkt-emerald-deep">{t("morningListTitle")}</div>
          <ul className="flex flex-col gap-2">
            {lines.map((line, i) => (
              <li key={line} className="mkt-rise flex items-start gap-2.5 text-[13px] leading-relaxed text-ink" style={{ "--i": i + 2 } as CSSProperties}>
                <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
