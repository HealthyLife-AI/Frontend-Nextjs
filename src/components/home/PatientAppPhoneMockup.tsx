"use client";

import { ShoppingCart, Sparkles, User, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * The detailed phone mockup from the Figma reference's Patient
 * Experience section (streak banner, water tracker, meal schedule) —
 * the only device mockup on this page, since the Figma hero has none.
 * Colors here are one-off illustrative
 * gradients that appear nowhere else in the page (the streak's amber,
 * the water tracker's cyan) — arbitrary Tailwind values, same exception
 * this project's own convention already makes for bespoke per-component
 * shadow/gradient compositions, rather than one-off design tokens.
 */
export function PatientAppPhoneMockup({ className = "" }: { className?: string }) {
  const m = useTranslations("home.patientApp.mockup");

  return (
    <div className={`rounded-[50px] bg-gradient-to-b from-[#334155] via-[#0f172a] to-[#020617] p-3 shadow-float ${className}`}>
      <div className="flex flex-col gap-4 rounded-[40px] border border-white/10 bg-gradient-to-b from-white to-canvas p-3.5">
        {/* Status bar */}
        <div className="flex items-center justify-between text-[11px] font-bold text-ink">
          <span>9:41</span>
          <span className="flex h-5 w-24 items-center justify-between rounded-full bg-ink px-2.5">
            <span className="h-2 w-2 rounded-full bg-card ring-1 ring-card/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" />
          </span>
        </div>

        {/* Header: avatar + greeting / notification + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-mkt-mint to-[#2dd4bf] text-xs font-bold text-mkt-emerald-deep ring-2 ring-white">
              س
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-divider bg-canvas">
              <Sparkles size={13} className="text-ink-muted" />
            </span>
          </div>
          <div className="text-end">
            <div className="text-[10px] font-semibold text-ink-muted">{m("date")}</div>
            <div className="text-sm font-extrabold text-ink">🌿 {m("greeting")}</div>
          </div>
        </div>

        {/* Streak banner */}
        <div className="flex items-center justify-between rounded-2xl border border-[#fde68a] bg-gradient-to-r from-[#fffbeb] to-[#fef3c7] p-2.5">
          <span className="rounded-full border border-[#fde68a] bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#b45309]">
            {m("streakBadge")}
          </span>
          <div className="flex items-center gap-2">
            <div className="text-end">
              <div className="text-xs font-black text-[#451a03]">{m("streakDays")}</div>
              <div className="text-[9px] font-medium text-[#b45309]">{m("streakRank")}</div>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f97316] text-xs">
              🔥
            </span>
          </div>
        </div>

        {/* Water tracker */}
        <div className="flex flex-col gap-2 rounded-2xl border border-divider bg-card/90 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-ink-muted">{m("waterTarget")}</span>
              <span className="text-xs font-black text-mkt-emerald-deep">{m("waterCurrent")}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
              {m("waterLabel")}
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#ecfeff]">💧</span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-divider">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#22d3ee] to-mkt-mint" />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-mkt-emerald-deep">{m("waterAdd")}</span>
            <span className="font-medium text-ink-muted">{m("waterRemaining")}</span>
          </div>
        </div>

        {/* Meal schedule */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold text-mkt-emerald-deep">{m("viewAll")}</span>
            <span className="text-xs font-bold text-ink">{m("mealScheduleTitle")}</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-divider bg-card p-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] text-[#059669]">
              ✓
            </span>
            <div className="text-end">
              <div className="text-[11px] font-bold text-ink">{m("breakfastName")}</div>
              <div className="text-[10px] font-semibold text-ink-muted">{m("breakfastTime")}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-mkt-mint-border bg-gradient-to-b from-mkt-mint-bg/70 to-mkt-mint-bg/30 p-3">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" />
              <span className="text-[10px] font-bold text-mkt-emerald-deep">{m("lunchTime")}</span>
            </div>
            <div className="text-end text-xs font-extrabold text-ink">{m("lunchName")}</div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-ink">
                {m("swapMeal")}
              </button>
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-mkt-emerald-deep to-mkt-mint px-3 py-1.5 text-[11px] font-bold text-card">
                {m("markEaten")} ✓
              </button>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between border-t border-divider pt-3 text-[10px] font-semibold text-ink-muted">
          <span className="flex flex-col items-center gap-1">
            <User size={16} />
            {m("navProfile")}
          </span>
          <span className="flex flex-col items-center gap-1">
            <ShoppingCart size={16} />
            {m("navShopping")}
          </span>
          <span className="flex flex-col items-center gap-1">
            <Sparkles size={16} />
            {m("navPlan")}
          </span>
          <span className="flex flex-col items-center gap-1 text-mkt-emerald-deep">
            <UtensilsCrossed size={16} />
            {m("navToday")}
          </span>
        </div>
      </div>
    </div>
  );
}
