"use client";

import { useLocale, useTranslations } from "next-intl";
import { Repeat } from "lucide-react";
import type { MealPlan } from "@/lib/mealPlans/types";
import { foodName, itemMacros, mealMacros, planMacros, planToSlots } from "./mealSlots";

/**
 * Read-only view of what a plan actually contains — the foods, their
 * gram quantities, and each item's permitted alternatives.
 *
 * Exists because a nutritionist cannot choose between templates from a
 * calorie total alone: two 800 kcal templates can be completely
 * different prescriptions, and the decision is made on the foods and the
 * macro split, not the headline number. `MealCard`/`MealItemRow` render
 * the same data but are editor controls (delete, swap, add alternative)
 * — this is the same information with nothing actionable in it.
 *
 * Reuses `planToSlots` + the `mealSlots` macro helpers rather than
 * recomputing, so this and the designer can never disagree about what a
 * plan totals.
 */
export function PlanBreakdown({ plan }: { plan: MealPlan }) {
  const t = useTranslations("planDesigner");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const locale = useLocale();

  const slots = planToSlots(plan).filter((slot) => slot.items.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {slots.map((slot) => {
        const macros = mealMacros(slot);
        const Icon = slot.icon;

        return (
          <div key={slot.slotKey} className="rounded-control border border-border bg-canvas p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon size={16} strokeWidth={1.75} className="text-primary" />
                <span className="text-sm font-semibold text-ink">{tSlots(slot.slotKey)}</span>
              </div>
              <span className="text-xs font-medium tabular-nums text-ink-muted">
                {t("caloriesValue", { value: macros.calories })}
              </span>
            </div>

            <ul className="mt-2 flex flex-col gap-2">
              {slot.items.map((item, index) => (
                <li key={item.id ?? index} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate text-sm text-ink">
                      {foodName(item.food, locale)}
                      <span className="ms-1.5 text-xs text-ink-muted tabular-nums">
                        {t("quantityGrams", { value: item.quantityGrams })}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                      {t("caloriesValue", { value: itemMacros(item).calories })}
                    </span>
                  </div>

                  {/* BR-4: the substitutes this item may be swapped for. */}
                  {item.alternatives.map((alt, altIndex) => (
                    <div
                      key={alt.id ?? `${index}-${altIndex}`}
                      className="flex items-baseline justify-between gap-2 ps-4 text-xs text-ink-muted"
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Repeat size={12} strokeWidth={2} className="shrink-0" />
                        <span className="truncate">
                          {foodName(alt.food, locale)}
                          <span className="ms-1.5 tabular-nums">
                            {t("quantityGrams", { value: alt.quantityGrams })}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {t("caloriesValue", { value: itemMacros(alt).calories })}
                      </span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The macro split, which is what actually decides whether a template
 * suits a given client's goal — a weight-loss plan and a muscle-gain
 * plan can share a calorie total and differ entirely here.
 *
 * Percentages are of CALORIES, not grams (protein/carbs 4 kcal/g, fat 9
 * — standard energy factors), the same basis `DailySummaryPanel` uses.
 */
export function PlanMacroSummary({ plan }: { plan: MealPlan }) {
  const t = useTranslations("planDesigner.summary");
  const macros = planMacros(planToSlots(plan));

  const calories = {
    protein: macros.protein_g * 4,
    carbs: macros.carbs_g * 4,
    fat: macros.fat_g * 9,
  };
  const total = calories.protein + calories.carbs + calories.fat || 1;

  const rows = [
    { key: "protein", grams: macros.protein_g, share: calories.protein / total, bar: "bg-primary" },
    { key: "carbs", grams: macros.carbs_g, share: calories.carbs / total, bar: "bg-accent" },
    { key: "fat", grams: macros.fat_g, share: calories.fat / total, bar: "bg-status-attention" },
  ] as const;

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-xs text-ink-muted">{t(row.key)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-muted/10">
            <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.share * 100}%` }} />
          </div>
          <span className="w-36 shrink-0 text-end text-xs tabular-nums text-ink-muted">
            {t("macroGrams", { value: row.grams, percent: Math.round(row.share * 100) })}
          </span>
        </div>
      ))}
    </div>
  );
}
