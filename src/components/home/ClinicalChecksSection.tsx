import type { CSSProperties } from "react";
import {
  Activity,
  Check,
  ClipboardCheck,
  Gauge,
  HeartPulse,
  Printer,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS: {
  icon: LucideIcon;
  titleKey: "item1Title" | "item2Title" | "item3Title" | "item4Title" | "item5Title" | "item6Title";
  bodyKey: "item1Body" | "item2Body" | "item3Body" | "item4Body" | "item5Body" | "item6Body";
}[] = [
  { icon: ShieldAlert, titleKey: "item1Title", bodyKey: "item1Body" },
  { icon: Activity, titleKey: "item2Title", bodyKey: "item2Body" },
  { icon: Gauge, titleKey: "item3Title", bodyKey: "item3Body" },
  { icon: HeartPulse, titleKey: "item4Title", bodyKey: "item4Body" },
  { icon: Wallet, titleKey: "item5Title", bodyKey: "item5Body" },
  { icon: Printer, titleKey: "item6Title", bodyKey: "item6Body" },
];

/**
 * The plan designer's clinical checks, which the rest of the page only
 * hints at: allergen conflicts, glycemic index/load and sodium warnings
 * (`NutritionWarningService`, shown per food while building), the
 * Mifflin-St Jeor suggestion and guideline floor, cost/prep preferences,
 * and print/templates. Six short items beside one "plan check" card
 * that shows those warnings the way the designer words them.
 *
 * The card is self-consistent on purpose: Sara's conditions are listed
 * so each warning has its reason (glycemic → insulin resistance, sodium
 * → hypertension), and the last row shows an alternative that clears
 * the glycemic flag (bulgur's load at 150 g is moderate, not high).
 */
export async function ClinicalChecksSection() {
  const t = await getTranslations("home.clinical");

  return (
    <section id="clinical" className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 end-[-12%] -z-0 h-[28rem] w-[28rem] rounded-full bg-mkt-glow/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", {
              highlight: (chunks) => (
                <span className="bg-gradient-to-r from-primary to-mkt-emerald bg-clip-text text-transparent">{chunks}</span>
              ),
            })}
            subtitle={t("subtitle")}
            align="start"
            className="mb-10 lg:mb-12"
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {ITEMS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <Reveal key={titleKey} delayMs={i * 60}>
                <div className="flex items-start gap-3 text-start">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mkt-mint-bg text-mkt-emerald-deep ring-1 ring-mkt-mint-border">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-snug text-ink">{t(titleKey)}</h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-muted">{t(bodyKey)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal variant="scale" delayMs={120}>
          <PlanCheckCard />
        </Reveal>
      </div>
    </section>
  );
}

async function PlanCheckCard() {
  const t = await getTranslations("home.clinical.visual");
  const rows: {
    icon: LucideIcon;
    foodKey: "row1Food" | "row2Food" | "row3Food" | "row4Food";
    noteKey: "row1Note" | "row2Note" | "row3Note" | "row4Note";
    tagKey: "row1Tag" | "row2Tag" | "row3Tag" | "row4Tag";
    tone: string;
  }[] = [
    { icon: ShieldAlert, foodKey: "row1Food", noteKey: "row1Note", tagKey: "row1Tag", tone: "bg-status-late-bg text-status-late" },
    { icon: Activity, foodKey: "row2Food", noteKey: "row2Note", tagKey: "row2Tag", tone: "bg-status-attention-bg text-status-attention" },
    { icon: TriangleAlert, foodKey: "row3Food", noteKey: "row3Note", tagKey: "row3Tag", tone: "bg-status-attention-bg text-status-attention" },
    { icon: Check, foodKey: "row4Food", noteKey: "row4Note", tagKey: "row4Tag", tone: "bg-status-on-track-bg text-status-on-track" },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-mkt-glow/25 via-transparent to-mkt-sky/40 blur-2xl sm:-inset-6" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/85 p-4 shadow-float ring-1 ring-ink/[0.06] backdrop-blur-xl sm:p-5">
        <div className="mkt-dots absolute inset-0 opacity-60" aria-hidden="true" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardCheck size={16} strokeWidth={2} />
              </span>
              {t("title")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mkt-mint-bg px-2.5 py-1 text-[11px] font-semibold text-mkt-emerald-deep">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mkt-mint animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mkt-mint" />
              </span>
              {t("live")}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["cond1", "cond2", "cond3"] as const).map((key) => (
              <span key={key} className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                {t(key)}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {rows.map(({ icon: Icon, foodKey, noteKey, tagKey, tone }, i) => (
              <div
                key={foodKey}
                className="mkt-rise flex items-center justify-between gap-3 rounded-2xl border border-divider bg-white px-3 py-2.5 text-start shadow-card"
                style={{ "--i": i } as CSSProperties}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <div className="mkt-nums truncate text-sm font-semibold text-ink">{t(foodKey)}</div>
                    <div className="mkt-nums truncate text-xs text-ink-muted">{t(noteKey)}</div>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>{t(tagKey)}</span>
              </div>
            ))}
          </div>

          <div
            className="mkt-rise mt-3 rounded-2xl border border-mkt-mint-border bg-gradient-to-br from-mkt-mint-bg to-white p-3.5 text-start"
            style={{ "--i": 4 } as CSSProperties}
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-ink">{t("calLabel")}</span>
              <span className="mkt-nums font-semibold text-primary">{t("calValue")}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className="mkt-grow h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: "97%", "--grow-delay": "0.55s" } as CSSProperties}
              />
            </div>
            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-mkt-emerald-deep">
              <Sparkles size={12} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span className="mkt-nums">{t("suggestion")}</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-ink-muted">{t("footnote")}</p>
        </div>
      </div>
    </div>
  );
}
