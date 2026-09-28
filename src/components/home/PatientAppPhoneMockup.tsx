import type { CSSProperties } from "react";
import { Check, Droplets, Flame, ShoppingCart, Sparkles, User, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * The client app's home screen (streak, water tracker, today's meals) in
 * a phone frame. Every color is a token: the streak card uses the
 * `attention` amber family, the water card the `sky`/`mint` family — the
 * earlier one-off hex gradients are gone. The water bar grows and the
 * rows rise when the surrounding `Reveal` marks the block in view.
 */
export function PatientAppPhoneMockup({ className = "" }: { className?: string }) {
  const m = useTranslations("home.patientApp.mockup");

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-gradient-to-b from-mkt-glow/40 via-primary/15 to-transparent blur-3xl" aria-hidden="true" />
      <div className="rounded-[3rem] bg-gradient-to-b from-ink via-mkt-night to-mkt-night p-2.5 shadow-float ring-1 ring-white/10">
        <div className="flex flex-col gap-3.5 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white to-canvas p-3.5">
          {/* Status bar */}
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-ink">
            <span className="mkt-nums">9:41</span>
            <span className="flex h-5 w-20 items-center justify-between rounded-full bg-ink px-2.5">
              <span className="h-2 w-2 rounded-full bg-card/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" />
            </span>
          </div>

          {/* Greeting */}
          <div className="flex items-center justify-between px-1">
            <div className="text-start">
              <div className="text-[10px] font-semibold text-ink-muted">{m("date")}</div>
              <div className="text-sm font-extrabold text-ink">{m("greeting")}</div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-mkt-mint to-primary text-xs font-bold text-white ring-2 ring-white">
              {m("greeting").slice(-1)}
            </span>
          </div>

          {/* Streak */}
          <div className="mkt-rise flex items-center justify-between rounded-2xl border border-status-attention/30 bg-status-attention-bg p-2.5" style={{ "--i": 0 } as CSSProperties}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-status-attention to-mkt-amber text-white">
                <Flame size={16} strokeWidth={2} />
              </span>
              <div className="text-start">
                <div className="text-xs font-extrabold text-ink">{m("streakDays")}</div>
                <div className="text-[9px] font-medium text-status-attention">{m("streakRank")}</div>
              </div>
            </div>
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-status-attention">{m("streakBadge")}</span>
          </div>

          {/* Water */}
          <div className="mkt-rise flex flex-col gap-2 rounded-2xl border border-divider bg-white p-3" style={{ "--i": 1 } as CSSProperties}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-mkt-sky/40 text-primary">
                  <Droplets size={12} strokeWidth={2.2} />
                </span>
                {m("waterLabel")}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="mkt-nums text-xs font-black text-mkt-emerald-deep">{m("waterCurrent")}</span>
                <span className="mkt-nums text-[10px] text-ink-muted">{m("waterTarget")}</span>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-divider">
              <div className="mkt-grow h-full w-[72%] rounded-full bg-gradient-to-r from-mkt-sky to-mkt-mint" style={{ "--grow-delay": "0.5s" } as CSSProperties} />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-mkt-emerald-deep">{m("waterAdd")}</span>
              <span className="font-medium text-ink-muted">{m("waterRemaining")}</span>
            </div>
          </div>

          {/* Meals */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-ink">{m("mealScheduleTitle")}</span>
              <span className="text-[10px] font-semibold text-mkt-emerald-deep">{m("viewAll")}</span>
            </div>

            <div className="mkt-rise flex items-center justify-between rounded-2xl border border-divider bg-white p-2.5" style={{ "--i": 2 } as CSSProperties}>
              <div className="text-start">
                <div className="text-[11px] font-bold text-ink">{m("breakfastName")}</div>
                <div className="text-[10px] font-semibold text-ink-muted">{m("breakfastTime")}</div>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-status-on-track-bg text-status-on-track">
                <Check size={14} strokeWidth={3} />
              </span>
            </div>

            <div className="mkt-rise flex flex-col gap-2.5 rounded-2xl border border-mkt-mint-border bg-gradient-to-b from-mkt-mint-bg to-white p-3" style={{ "--i": 3 } as CSSProperties}>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" />
                <span className="text-[10px] font-bold text-mkt-emerald-deep">{m("lunchTime")}</span>
              </div>
              <div className="text-start text-xs font-extrabold text-ink">{m("lunchName")}</div>
              <div className="flex items-center gap-2">
                <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-mkt-emerald-deep to-mkt-mint px-3 py-1.5 text-[11px] font-bold text-white">
                  <Check size={12} strokeWidth={3} />
                  {m("markEaten")}
                </span>
                <span className="rounded-xl border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-ink">{m("swapMeal")}</span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-between border-t border-divider px-1 pt-3 text-[10px] font-semibold text-ink-muted">
            <span className="flex flex-col items-center gap-1 text-mkt-emerald-deep">
              <UtensilsCrossed size={16} />
              {m("navToday")}
            </span>
            <span className="flex flex-col items-center gap-1">
              <Sparkles size={16} />
              {m("navPlan")}
            </span>
            <span className="flex flex-col items-center gap-1">
              <ShoppingCart size={16} />
              {m("navShopping")}
            </span>
            <span className="flex flex-col items-center gap-1">
              <User size={16} />
              {m("navProfile")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
