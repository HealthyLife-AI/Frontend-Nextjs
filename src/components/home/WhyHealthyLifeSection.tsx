import type { ReactNode } from "react";
import { BarChart3, Bot, Languages, LineChart, ShieldCheck, Users, Zap, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AiDraftVisual, AnalyticsVisual, ClientsVisual, FollowUpVisual, LanguageVisual, PrivacyVisual } from "./BentoVisuals";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SpotlightGrid } from "./SpotlightGrid";

/**
 * "Why HealthyLife" as a bento grid: four capability cards with live,
 * CSS-drawn product visuals (`BentoVisuals`) and two smaller trust
 * tiles (privacy, Arabic-first). The grid is wrapped in `SpotlightGrid`
 * so a soft glow and lit border follow the cursor across the cards.
 *
 * Replaces the earlier four-illustration row: the raster illustrations
 * were soft on 2x screens and said nothing specific about the product,
 * while these visuals are built from the product's own states (an
 * allergy-checked draft, an adherence split, a weight trend).
 */
export async function WhyHealthyLifeSection() {
  const t = await getTranslations("home.why");

  return (
    <section id="why" className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 end-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-mkt-sky/40 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t.rich("title", {
            highlight: (chunks) => (
              <span className="bg-gradient-to-br from-primary via-mkt-teal-deep to-mkt-emerald bg-clip-text text-transparent">{chunks}</span>
            ),
          })}
          subtitle={t("subtitle")}
        />

        <SpotlightGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <Card className="sm:col-span-2 lg:col-span-3 lg:row-span-2" delayMs={0} icon={Bot} title={t("item1Title")} body={t("item1Body")} chip={t("item1Chip")} chipIcon={Zap} visual={<AiDraftVisual />} tall />
          <Card className="lg:col-span-3" delayMs={80} icon={Users} title={t("item2Title")} body={t("item2Body")} chip={t("item2Chip")} chipIcon={Users} visual={<ClientsVisual />} />
          <Card className="lg:col-span-3" delayMs={160} icon={LineChart} title={t("item3Title")} body={t("item3Body")} chip={t("item3Chip")} chipIcon={LineChart} visual={<FollowUpVisual />} />
          <Card className="lg:col-span-2" delayMs={240} icon={BarChart3} title={t("item4Title")} body={t("item4Body")} chip={t("item4Chip")} chipIcon={BarChart3} visual={<AnalyticsVisual />} />
          <Card className="lg:col-span-2" delayMs={320} icon={ShieldCheck} title={t("tile1Title")} body={t("tile1Body")} visual={<PrivacyVisual />} />
          <Card className="lg:col-span-2" delayMs={400} icon={Languages} title={t("tile2Title")} body={t("tile2Body")} visual={<LanguageVisual />} />
        </SpotlightGrid>
      </div>
    </section>
  );
}

function Card({
  className = "",
  delayMs,
  icon: Icon,
  title,
  body,
  chip,
  chipIcon: ChipIcon,
  visual,
  tall = false,
}: {
  className?: string;
  delayMs: number;
  icon: LucideIcon;
  title: string;
  body: string;
  chip?: string;
  chipIcon?: LucideIcon;
  visual: ReactNode;
  tall?: boolean;
}) {
  return (
    <Reveal delayMs={delayMs} className={`h-full ${className}`} variant="scale">
      <article className="mkt-spot flex h-full flex-col rounded-3xl border border-ink/[0.07] bg-white p-5 text-start shadow-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-card-hover sm:p-6">
        <div className={`relative ${tall ? "mb-6 flex-1" : "mb-5"}`}>{visual}</div>
        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mkt-mint-bg text-mkt-emerald-deep ring-1 ring-mkt-mint-border">
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug text-ink">{title}</h3>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-muted">{body}</p>
            {chip && ChipIcon ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-mkt-forest">
                <ChipIcon size={13} strokeWidth={2} />
                {chip}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
