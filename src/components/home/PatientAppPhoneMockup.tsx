import type { CSSProperties } from "react";
import { CalendarClock, Check, Footprints, ShoppingCart, Sparkles, User, UtensilsCrossed, Video } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * The client app's home screen in a phone frame, showing only what the
 * app really has: today's appointment reminder and plan activity (both
 * from the morning summary, `TodaySummary` on the backend) above today's
 * meals. There is deliberately no water tracker or streak — the app has
 * neither, and the page shouldn't promise them. Every color is a token;
 * the rows rise when the surrounding `Reveal` marks the block in view.
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
              {m("initial")}
            </span>
          </div>

          {/* Appointment reminder — the app's own "appointment today" line. */}
          <div className="mkt-rise flex items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-mkt-sky/30 to-white p-2.5" style={{ "--i": 0 } as CSSProperties}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white">
                <CalendarClock size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0 text-start">
                <div className="text-[9px] font-semibold text-primary">{m("apptLabel")}</div>
                <div className="truncate text-[11px] font-extrabold text-ink">{m("apptBody")}</div>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-primary">
              <Video size={11} strokeWidth={2.2} />
              {m("apptChannel")}
            </span>
          </div>

          {/* Today's activity — informational in the app (no calorie burn, no check-off). */}
          <div className="mkt-rise flex items-center justify-between gap-2 rounded-2xl border border-divider bg-white p-2.5" style={{ "--i": 1 } as CSSProperties}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mkt-mint-bg text-mkt-emerald-deep">
                <Footprints size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0 text-start">
                <div className="text-[9px] font-semibold text-ink-muted">{m("activityLabel")}</div>
                <div className="truncate text-[11px] font-extrabold text-ink">{m("activityName")}</div>
              </div>
            </div>
            <div className="shrink-0 text-end">
              <div className="mkt-nums text-[11px] font-black text-mkt-emerald-deep">{m("activityMinutes")}</div>
              <div className="text-[9px] font-medium text-ink-muted">{m("activityTimes")}</div>
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
