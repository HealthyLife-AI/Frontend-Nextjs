"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BadgeCheck,
  BellRing,
  BrainCircuit,
  Languages,
  MessageCircle,
  Send,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  Trophy,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS: {
  icon: LucideIcon;
  noteIcon: LucideIcon;
  numberKey: "step1Number" | "step2Number" | "step3Number";
  titleKey: "step1Title" | "step2Title" | "step3Title";
  bodyKey: "step1Body" | "step2Body" | "step3Body";
  noteKey: "step1Note" | "step2Note" | "step3Note";
  tile: string;
}[] = [
  { icon: UserPlus, noteIcon: BadgeCheck, numberKey: "step1Number", titleKey: "step1Title", bodyKey: "step1Body", noteKey: "step1Note", tile: "bg-primary" },
  { icon: SlidersHorizontal, noteIcon: Zap, numberKey: "step2Number", titleKey: "step2Title", bodyKey: "step2Body", noteKey: "step2Note", tile: "bg-mkt-jade" },
  { icon: BrainCircuit, noteIcon: BellRing, numberKey: "step3Number", titleKey: "step3Title", bodyKey: "step3Body", noteKey: "step3Note", tile: "bg-mkt-amber" },
];

/**
 * Sticky-panel scrollytelling. One IntersectionObserver watches the
 * three step blocks against a band across the middle of the viewport;
 * whichever step sits in that band is "active", which highlights it,
 * fills the progress rail beside the list, and swaps the scene shown in
 * the sticky panel (`.mkt-scene[data-active]` in globals.css handles
 * the crossfade and re-triggers each scene's own micro animations).
 *
 * Below `lg` the panel sits above the list and is not sticky, but the
 * same observer still drives it, so scrolling the steps still changes
 * the picture.
 */
export function HowItWorksSteps() {
  const t = useTranslations("home.howItWorks");
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = stepRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(Number((hit.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-38% 0px -42% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
      {/* Sticky scene panel */}
      <div className="order-first lg:order-last">
        <div className="lg:sticky lg:top-28">
          <div className="relative">
            {/* -inset-3 on mobile, not -inset-6: at the 16px page gutter the wider halo bled past
                the viewport edge and forced a horizontal scrollbar on the whole page. */}
            <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-mkt-glow/25 via-transparent to-mkt-sky/40 blur-2xl sm:-inset-6" aria-hidden="true" />
            <div className="relative min-h-[25rem] overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-3 shadow-float ring-1 ring-ink/[0.06] backdrop-blur-xl sm:aspect-[4/3.1] sm:min-h-0 sm:p-4">
              <div className="mkt-dots absolute inset-0 -z-0 opacity-70" aria-hidden="true" />
              <InviteScene active={active === 0} />
              <PlanScene active={active === 1} />
              <WatchScene active={active === 2} />
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => stepRefs.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" })}
                className={`h-1.5 rounded-full transition-all duration-500 ${active === i ? "w-8 bg-primary" : "w-2 bg-ink/15"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="relative flex flex-col gap-6 lg:gap-10 lg:py-10">
        <span className="pointer-events-none absolute inset-y-0 start-6 hidden w-px bg-divider lg:block" aria-hidden="true">
          <span
            className="block w-full origin-top bg-gradient-to-b from-primary to-accent transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ height: `${((active + 1) / STEPS.length) * 100}%` }}
          />
        </span>

        {STEPS.map(({ icon: Icon, noteIcon: NoteIcon, numberKey, titleKey, bodyKey, noteKey, tile }, i) => {
          const isActive = active === i;
          return (
            <li key={titleKey}>
              <div
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-step={i}
                onClick={() => setActive(i)}
                className={`group relative rounded-3xl border p-6 text-start transition-[background-color,border-color,box-shadow,opacity,transform] duration-500 lg:ps-20 ${
                  isActive
                    ? "border-primary/25 bg-white shadow-panel opacity-100"
                    : "border-transparent bg-transparent opacity-60 hover:opacity-90"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-brand transition-transform duration-500 lg:absolute lg:start-0 lg:top-6 lg:mb-0 lg:-translate-x-1/2 lg:rtl:translate-x-1/2 ${tile} ${
                    isActive ? "scale-100" : "scale-90"
                  }`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`mkt-nums text-sm font-bold ${isActive ? "text-primary" : "text-ink-muted"}`}>{t(numberKey)}</span>
                  <span className="h-px flex-1 bg-divider" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-xl font-bold text-ink lg:text-2xl">{t(titleKey)}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-muted">{t(bodyKey)}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-2 text-sm font-medium text-ink-muted">
                  <NoteIcon size={16} strokeWidth={1.9} className="text-accent-active" />
                  {t(noteKey)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SceneFrame({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div data-active={active ? "" : undefined} aria-hidden={!active} className="mkt-scene absolute inset-3 flex flex-col sm:inset-4">
      {children}
    </div>
  );
}

function Rise({ i, className = "", children }: { i: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={`mkt-rise ${className}`} style={{ "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

function InviteScene({ active }: { active: boolean }) {
  const t = useTranslations("home.howItWorks.scene1");

  return (
    <SceneFrame active={active}>
      <div className="flex h-full flex-col gap-3">
        <Rise i={0} className="rounded-2xl border border-divider bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus size={15} strokeWidth={2} />
            </span>
            {t("title")}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label={t("nameLabel")} value={t("nameValue")} />
            <Field label={t("phoneLabel")} value={t("phoneValue")} ltr />
            <Field label={t("goalLabel")} value={t("goalValue")} />
            <div className="flex items-end">
              <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-mkt-teal-deep text-sm font-bold text-white shadow-brand">
                <Send size={15} strokeWidth={2} className="rtl:-scale-x-100" />
                {t("submit")}
              </span>
            </div>
          </div>
        </Rise>

        <Rise i={2} className="ms-auto max-w-[85%] rounded-2xl rounded-ss-md border border-status-on-track/30 bg-status-on-track-bg/70 p-3.5 text-start shadow-card">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-mkt-emerald-deep">
            <MessageCircle size={13} strokeWidth={2} />
            {t("waFrom")}
          </div>
          <p className="text-sm leading-relaxed text-ink">{t("waBody")}</p>
          <span dir="ltr" className="mkt-nums mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-primary shadow-[0_1px_2px_rgba(11,46,48,0.06)]">
            🔗 {t("waLink")}
          </span>
        </Rise>

        <Rise i={4} className="mt-auto flex items-center gap-2 text-xs font-semibold text-ink-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-attention animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-attention" />
          </span>
          {t("status")}
        </Rise>
      </div>
    </SceneFrame>
  );
}

function Field({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-canvas/70 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div dir={ltr ? "ltr" : undefined} className="mkt-nums truncate text-start text-sm font-semibold text-ink">
        {value}
      </div>
    </div>
  );
}

function PlanScene({ active }: { active: boolean }) {
  const t = useTranslations("home.howItWorks.scene2");
  const macros: { key: "calories" | "protein" | "carbs" | "fat"; value: string; width: string; tone: string }[] = [
    { key: "calories", value: "1,650", width: "82%", tone: "bg-primary" },
    { key: "protein", value: "118 g", width: "92%", tone: "bg-accent" },
    { key: "carbs", value: "170 g", width: "64%", tone: "bg-status-attention" },
    { key: "fat", value: "52 g", width: "48%", tone: "bg-mkt-jade" },
  ];

  return (
    <SceneFrame active={active}>
      <div className="flex h-full flex-col gap-3">
        <Rise i={0} className="flex items-center justify-between rounded-2xl border border-divider bg-white px-4 py-3 shadow-card">
          <span className="text-sm font-bold text-ink">{t("title")}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mkt-mint-bg px-2.5 py-1 text-[11px] font-semibold text-mkt-emerald-deep">
            <Sparkles size={12} />
            {t("autoCalc")}
          </span>
        </Rise>

        <div className="flex flex-col gap-2">
          <MealRow i={1} label={t("breakfast")} meal={t("breakfastMeal")} kcal="310" />
          <Rise i={2} className="rounded-2xl border border-primary/30 bg-white p-3 text-start shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-ink-muted">{t("lunch")}</div>
                <div className="truncate text-sm font-bold text-ink">{t("lunchMeal")}</div>
              </div>
              <span className="mkt-nums shrink-0 text-sm font-bold text-primary">540</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-ink-muted">{t("alternatives")}:</span>
              <span className="rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-2 py-0.5 font-semibold text-mkt-emerald-deep">{t("alt1")}</span>
              <span className="rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-2 py-0.5 font-semibold text-mkt-emerald-deep">{t("alt2")}</span>
            </div>
          </Rise>
          <MealRow i={3} label={t("dinner")} meal={t("dinnerMeal")} kcal="480" />
        </div>

        <Rise i={4} className="mt-auto grid grid-cols-4 gap-2 rounded-2xl border border-divider bg-white p-3 shadow-card">
          {macros.map(({ key, value, width, tone }, i) => (
            <div key={key} className="min-w-0 text-start">
              <div className="truncate text-[10px] font-semibold text-ink-muted">{t(key)}</div>
              <div className="mkt-nums text-sm font-bold text-ink">{value}</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className={`mkt-grow h-full rounded-full ${tone}`} style={{ width, "--grow-delay": `${0.35 + i * 0.1}s` } as CSSProperties} />
              </div>
            </div>
          ))}
        </Rise>
      </div>
    </SceneFrame>
  );
}

function MealRow({ i, label, meal, kcal }: { i: number; label: string; meal: string; kcal: string }) {
  return (
    <Rise i={i} className="flex items-center justify-between gap-3 rounded-2xl border border-divider bg-white px-3 py-2.5 text-start shadow-card">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-ink-muted">{label}</div>
        <div className="truncate text-sm font-semibold text-ink">{meal}</div>
      </div>
      <span className="mkt-nums shrink-0 text-sm font-bold text-ink-muted">{kcal}</span>
    </Rise>
  );
}

function WatchScene({ active }: { active: boolean }) {
  const t = useTranslations("home.howItWorks.scene3");
  const alerts: { icon: LucideIcon; textKey: "alert1" | "alert2" | "alert3"; tagKey: "alert1Tag" | "alert2Tag" | "alert3Tag"; tone: string }[] = [
    { icon: BellRing, textKey: "alert1", tagKey: "alert1Tag", tone: "bg-status-late-bg text-status-late" },
    { icon: TrendingDown, textKey: "alert2", tagKey: "alert2Tag", tone: "bg-status-attention-bg text-status-attention" },
    { icon: Trophy, textKey: "alert3", tagKey: "alert3Tag", tone: "bg-status-on-track-bg text-status-on-track" },
  ];

  return (
    <SceneFrame active={active}>
      <div className="flex h-full flex-col gap-3">
        <Rise i={0} className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-status-late-bg text-status-late">
            <BellRing size={15} strokeWidth={2} />
          </span>
          {t("title")}
        </Rise>
        <div className="flex flex-col gap-2">
          {alerts.map(({ icon: Icon, textKey, tagKey, tone }, i) => (
            <Rise key={textKey} i={i + 1} className="flex items-center justify-between gap-3 rounded-2xl border border-divider bg-white px-3 py-2.5 text-start shadow-card">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className="truncate text-sm font-semibold text-ink">{t(textKey)}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>{t(tagKey)}</span>
            </Rise>
          ))}
        </div>
        <Rise i={5} className="mt-auto rounded-2xl border border-mkt-mint-border bg-gradient-to-br from-mkt-mint-bg to-white p-3.5 text-start shadow-card">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-mkt-emerald-deep">
              <Sparkles size={13} strokeWidth={2} />
              {t("summaryTitle")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
              <Languages size={11} /> AR
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink">{t("summaryBody")}</p>
        </Rise>
      </div>
    </SceneFrame>
  );
}
