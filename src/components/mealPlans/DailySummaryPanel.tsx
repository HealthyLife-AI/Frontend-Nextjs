"use client";

import { useTranslations } from "next-intl";
import { Flame, Wheat } from "lucide-react";
import { fiberGrams, planMacros, type EditableMeal } from "./mealSlots";

/**
 * S3-09's sticky "live daily summary" (FR-14). The approved Stitch
 * reference also shows a per-macro *target range* ("بروتين 138 جم —
 * الهدف: 135-145 جم") and sodium/water/added-sugar figures — this app's
 * `HealthProfile` only stores a single calorie target (BR-7: Mifflin-St
 * Jeor), no macro-gram targets, and `Food` has no sodium/sugar fields at
 * all. Rather than invent numbers the backend never asked for, this
 * shows each macro's real computed grams and its real share of total
 * calories (protein/carbs = 4 kcal/g, fat = 9 kcal/g — standard energy
 * factors, not this app's own invention) instead of a target it never
 * set, and fiber (genuinely stored per food) in place of
 * sodium/water/sugar (not stored anywhere).
 */
export function DailySummaryPanel({
  meals,
  calorieTarget,
}: {
  meals: EditableMeal[];
  calorieTarget: number | null;
}) {
  const t = useTranslations("planDesigner.summary");
  const macros = planMacros(meals);
  const fiber = fiberGrams(meals);

  const percent = calorieTarget ? Math.round((macros.calories / calorieTarget) * 100) : null;
  const ringPercent = percent === null ? 0 : Math.min(100, percent);
  const isOverTarget = percent !== null && percent > 100;

  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference * (1 - ringPercent / 100);

  const macroCalories = { protein: macros.protein_g * 4, carbs: macros.carbs_g * 4, fat: macros.fat_g * 9 };
  const totalMacroCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fat || 1;

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink">{t("title")}</h3>
            <p className="text-xs text-ink-muted">{t("subtitle")}</p>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-canvas)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={isOverTarget ? "var(--color-status-late)" : "var(--color-primary)"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tabular-nums text-ink">{macros.calories}</span>
              {calorieTarget ? (
                <span className="mt-1 text-xs text-ink-muted">{t("ofTarget", { value: calorieTarget })}</span>
              ) : (
                <span className="mt-1 max-w-[7rem] text-xs text-ink-muted">{t("noTarget")}</span>
              )}
            </div>
          </div>
        </div>

        {percent !== null && (
          <div
            className={`flex items-start gap-2 rounded-control p-2.5 ${
              isOverTarget ? "bg-status-late-bg" : "bg-status-on-track-bg"
            }`}
          >
            <Flame size={18} className={isOverTarget ? "text-status-late" : "text-status-on-track"} />
            <span className={`text-sm font-medium ${isOverTarget ? "text-status-late" : "text-status-on-track"}`}>
              {isOverTarget ? t("overTarget", { value: macros.calories - calorieTarget! }) : t("percentAchieved", { value: percent })}
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink">{t("macrosTitle")}</span>
          <MacroBar label={t("protein")} grams={macros.protein_g} sharePercent={(macroCalories.protein / totalMacroCalories) * 100} colorClass="bg-primary" />
          <MacroBar label={t("carbs")} grams={macros.carbs_g} sharePercent={(macroCalories.carbs / totalMacroCalories) * 100} colorClass="bg-accent" />
          <MacroBar label={t("fat")} grams={macros.fat_g} sharePercent={(macroCalories.fat / totalMacroCalories) * 100} colorClass="bg-status-attention" />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-control border-t border-divider pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Wheat size={15} />
            {t("fiber")}
          </span>
          <span className="font-semibold text-ink">{t("fiberValue", { value: fiber })}</span>
        </div>
      </div>
    </aside>
  );
}

function MacroBar({
  label,
  grams,
  sharePercent,
  colorClass,
}: {
  label: string;
  grams: number;
  sharePercent: number;
  colorClass: string;
}) {
  const t = useTranslations("planDesigner.summary");
  const safeShare = Number.isFinite(sharePercent) ? Math.round(sharePercent) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink-muted">{t("macroGrams", { value: grams, percent: safeShare })}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(100, safeShare)}%` }} />
      </div>
    </div>
  );
}
