"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BarChart3,
  BellRing,
  Check,
  Lock,
  MessageCircle,
  Sparkles,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { prefersReducedMotion, useInView } from "./useInView";

const TOAST_INTERVAL_MS = 3000;

const TOASTS: { icon: LucideIcon; tone: string; titleKey: "toast1Title" | "toast2Title" | "toast3Title"; bodyKey: "toast1Body" | "toast2Body" | "toast3Body" }[] = [
  { icon: BellRing, tone: "bg-status-attention-bg text-status-attention", titleKey: "toast1Title", bodyKey: "toast1Body" },
  { icon: MessageCircle, tone: "bg-status-on-track-bg text-status-on-track", titleKey: "toast2Title", bodyKey: "toast2Body" },
  { icon: Sparkles, tone: "bg-primary/10 text-primary", titleKey: "toast3Title", bodyKey: "toast3Body" },
];

const RING_RADIUS = 26;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const RING_VALUE = 0.92;

/**
 * The hero's product visual: a clinic-portal frame that starts tipped
 * back in perspective and levels out as it enters the viewport
 * (`.mkt-tilt`), then follows the pointer by a few degrees. Two
 * "satellite" cards float over it at different parallax depths:
 *
 * - a notification that cycles through the platform's proactive loop
 *   (adherence alert → WhatsApp reminder → weekly AI summary), which is
 *   the product's core promise shown rather than described;
 * - an adherence ring that draws itself to 92% once on screen.
 *
 * Illustrative data (fictional clinic and client), same convention as
 * every other mockup on this page. Pointer tracking only attaches on
 * fine-pointer devices with motion allowed; touch and reduced-motion
 * users get the flat, resting composition.
 */
export function HeroVisual() {
  const t = useTranslations("home.hero.visual");
  const { ref: stageRef, inView } = useInView<HTMLDivElement>({ threshold: 0.2, rootMargin: "0px" });
  const frame = useRef(0);
  const [pointer, setPointer] = useState(false);
  const [toast, setToast] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
        stage.style.setProperty("--tilt-x", x.toFixed(3));
        stage.style.setProperty("--tilt-y", y.toFixed(3));
      });
    };
    const onEnter = () => setPointer(true);
    const onLeave = () => {
      cancelAnimationFrame(frame.current);
      stage.style.setProperty("--tilt-x", "0");
      stage.style.setProperty("--tilt-y", "0");
      setPointer(false);
    };

    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame.current);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [stageRef]);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const id = window.setInterval(() => setToast((i) => (i + 1) % TOASTS.length), TOAST_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={stageRef}
      data-inview={inView ? "" : undefined}
      data-pointer={pointer ? "" : undefined}
      className="mkt-stage relative mx-auto mt-16 max-w-5xl lg:mt-20"
    >
      {/* Glow bed under the frame. */}
      <div
        className="pointer-events-none absolute inset-x-8 top-12 -z-10 h-[70%] rounded-full bg-gradient-to-r from-mkt-glow/40 via-primary/25 to-mkt-sky/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="mkt-tilt rounded-3xl border border-white/80 bg-white/85 p-2 shadow-float ring-1 ring-ink/[0.06] backdrop-blur-xl sm:p-3">
        <div className="rounded-2xl border border-divider bg-canvas/60">
          {/* Window chrome */}
          <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-2.5">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-status-late/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-status-attention/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-status-on-track/70" />
            </div>
            <div className="hidden items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs text-ink-muted shadow-[0_1px_2px_rgba(11,46,48,0.06)] sm:flex">
              <Lock size={11} />
              <span dir="ltr" className="mkt-nums">{t("chromeUrl")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span className="hidden sm:inline">{t("clinicName")}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-on-track-bg px-2 py-0.5 text-[11px] font-semibold text-status-on-track">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-status-on-track animate-pulse-ring" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-on-track" />
                </span>
                {t("live")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-3 text-start md:grid-cols-[168px_1fr] md:p-4">
            {/* Nav rail */}
            <div className="hidden flex-col gap-1 md:flex">
              <NavItem icon={Users} label={t("navPatients")} active />
              <NavItem icon={UtensilsCrossed} label={t("navLibrary")} />
              <NavItem icon={BellRing} label={t("navAlerts")} badge="3" />
              <NavItem icon={BarChart3} label={t("navReports")} />
              <div className="mt-auto rounded-xl border border-mkt-mint-border bg-mkt-mint-bg p-2.5 text-[11px] leading-snug text-mkt-emerald-deep">
                <span className="mb-1 flex items-center gap-1 font-bold">
                  <Sparkles size={12} /> AI
                </span>
                {t("aiChip")}
              </div>
            </div>

            {/* Main */}
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-card">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mkt-mint to-primary text-sm font-bold text-white">
                    {t("patientName").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">{t("patientName")}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-on-track-bg px-2 py-0.5 text-[11px] font-semibold text-status-on-track">
                        <Check size={11} strokeWidth={3} />
                        {t("patientAdherent")}
                      </span>
                    </div>
                    <span className="block truncate text-xs text-ink-muted">{t("patientGoal")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="rounded-lg border border-border bg-white px-2.5 py-1.5 font-medium text-ink">{t("actionEdit")}</span>
                  <span className="rounded-lg bg-mkt-teal-deep px-2.5 py-1.5 font-semibold text-white">{t("actionWhatsapp")}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <Metric label={t("metricCalories")} value="1,650" unit={t("metricCaloriesUnit")} tone="bg-primary" text="text-primary" width="88%" delay="0.3s" />
                <Metric label={t("metricProtein")} value="118" unit={t("metricProteinUnit")} tone="bg-accent" text="text-accent-active" width="98%" delay="0.45s" />
                <Metric label={t("metricStreak")} value="14" unit={t("metricStreakUnit")} tone="bg-status-attention" text="text-status-attention" width="70%" delay="0.6s" />
              </div>

              <div className="rounded-xl bg-white p-3 shadow-card">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">{t("mealTitle")}</span>
                  <span className="mkt-nums font-semibold text-primary">{t("mealKcal")}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-divider bg-canvas/70 p-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mkt-mint-bg text-mkt-emerald-deep">
                      <UtensilsCrossed size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{t("mealName")}</div>
                      <div className="truncate text-[11px] text-ink-muted">{t("mealAlt")}</div>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-status-on-track-bg px-2 py-1 text-[11px] font-semibold text-status-on-track">
                    <Check size={11} strokeWidth={3} />
                    {t("mealLogged")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite: cycling notification */}
      <div
        className="mkt-satellite absolute -start-2 top-24 hidden w-[17.5rem] md:block lg:-start-14 lg:top-28"
        style={{ "--depth": 1.8 } as CSSProperties}
      >
        <div className="relative h-[4.75rem]">
          {TOASTS.map(({ icon: Icon, tone, titleKey, bodyKey }, i) => (
            <div
              key={titleKey}
              data-active={toast === i ? "" : undefined}
              aria-hidden={toast !== i}
              className="mkt-toast absolute inset-0 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-float ring-1 ring-ink/[0.06] backdrop-blur-xl"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 text-start">
                <div className="text-[13px] font-bold text-ink">{t(titleKey)}</div>
                <div className="truncate text-xs text-ink-muted">{t(bodyKey)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
          {TOASTS.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${toast === i ? "w-4 bg-primary" : "w-1.5 bg-ink/15"}`} />
          ))}
        </div>
      </div>

      {/* Satellite: adherence ring */}
      <div
        className="mkt-satellite absolute -bottom-6 end-2 hidden w-56 md:block lg:-end-8 lg:bottom-12"
        style={{ "--depth": 1.3 } as CSSProperties}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-float ring-1 ring-ink/[0.06] backdrop-blur-xl animate-float-slow">
          <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={RING_RADIUS} fill="none" stroke="currentColor" strokeWidth="6" className="text-divider" />
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#hero-ring)"
              strokeWidth="6"
              strokeLinecap="round"
              className="mkt-ring"
              style={{ "--ring-length": RING_LENGTH, "--ring-target": RING_LENGTH * (1 - RING_VALUE) } as CSSProperties}
            />
            <defs>
              <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-accent)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-start">
            <div className="mkt-nums text-2xl font-extrabold leading-none text-ink">92%</div>
            <div className="mt-1 text-[11px] font-semibold text-ink-muted">{t("ringLabel")}</div>
            <div className="text-[11px] font-semibold text-status-on-track">{t("ringSub")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, badge }: { icon: LucideIcon; label: string; active?: boolean; badge?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] ${
        active ? "bg-white font-semibold text-primary shadow-card" : "text-ink-muted"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      {badge ? <span className="rounded-full bg-status-late-bg px-1.5 py-0.5 text-[10px] font-bold text-status-late">{badge}</span> : null}
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone,
  text,
  width,
  delay,
}: {
  label: string;
  value: string;
  unit: string;
  tone: string;
  text: string;
  width: string;
  delay: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-2.5 shadow-card sm:p-3">
      <span className="block truncate text-[11px] text-ink-muted sm:text-xs">{label}</span>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`mkt-nums text-lg font-extrabold sm:text-xl ${text}`}>{value}</span>
        <span className="truncate text-[10px] text-ink-muted sm:text-[11px]">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className={`mkt-grow h-full rounded-full ${tone}`} style={{ width, "--grow-delay": delay } as CSSProperties} />
      </div>
    </div>
  );
}
