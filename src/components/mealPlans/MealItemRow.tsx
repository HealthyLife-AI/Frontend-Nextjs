"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Repeat, Trash2 } from "lucide-react";
import type { Food } from "@/lib/clients/types";
import { AllergenNotice, useAllergenChecks } from "./AllergenChecks";
import { FoodAutocomplete } from "./FoodAutocomplete";
import { displayCalories, displayGrams, foodName, itemMacros, type EditableItem } from "./mealSlots";

/**
 * One planned item and its permitted alternatives (BR-4), indented
 * beneath it exactly as the approved Stitch reference shows — nested
 * visually because that's the actual relationship, not a flat list with
 * a badge.
 *
 * Each row wraps rather than squeezing: on a 360px phone the food name
 * keeps a floor of 7rem and the numbers and buttons drop to a second
 * line, instead of the name being crushed to a single letter ("ر") while
 * the action cluster keeps its full width.
 */
export function MealItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: EditableItem;
  onChange: (next: EditableItem) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("planDesigner");
  const locale = useLocale();
  const [addingAlternative, setAddingAlternative] = useState(false);
  const { checks, nutritionFor } = useAllergenChecks();

  function addAlternative(food: Food, quantityGrams: number) {
    onChange({ ...item, alternatives: [...item.alternatives, { food, quantityGrams, alternatives: [] }] });
    setAddingAlternative(false);
  }

  function removeAlternative(index: number) {
    onChange({ ...item, alternatives: item.alternatives.filter((_, i) => i !== index) });
  }

  /** "تبديل" in the reference — promotes this alternative to the planned item, demoting the current one to take its place. */
  function promoteAlternative(index: number) {
    const promoted = item.alternatives[index];
    const rest = item.alternatives.filter((_, i) => i !== index);
    const demoted: EditableItem = { food: item.food, quantityGrams: item.quantityGrams, alternatives: [] };
    onChange({ ...promoted, alternatives: [demoted, ...rest] });
  }

  const macros = itemMacros(item);

  return (
    <div className="flex flex-col gap-1.5 rounded-field p-1">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-field bg-canvas/60 px-3 py-2">
        <div className="flex min-w-[7rem] flex-1 flex-wrap items-baseline gap-x-2">
          <span className="min-w-0 max-w-full truncate text-sm font-semibold text-ink" title={foodName(item.food, locale)}>
            {foodName(item.food, locale)}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-ink-muted">{t("quantityGrams", { value: displayGrams(item.quantityGrams) })}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium tabular-nums text-ink">{t("caloriesValue", { value: displayCalories(macros.calories) })}</span>
          <button
            type="button"
            onClick={() => setAddingAlternative(true)}
            title={t("addAlternative")}
            className="inline-flex items-center gap-1 rounded bg-accent/15 px-2 py-1 text-xs font-medium text-accent-active hover:bg-accent/25"
          >
            <Repeat size={13} />
            <span className="hidden sm:inline">{t("addAlternative")}</span>
          </button>
          <button type="button" onClick={onRemove} className="text-ink-muted hover:text-danger" aria-label={t("removeItem")}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Pilot feedback 2, A5: the planned item's own warning, shown as soon as the food is in the row, saved or not. */}
      <div className="px-1 empty:hidden">
        <AllergenNotice check={checks[item.food.id]} nutrition={nutritionFor(item.food.id, item.quantityGrams)} compact />
      </div>

      {item.alternatives.length > 0 && (
        <div className="ms-6 flex flex-col gap-1.5 rounded-field bg-canvas/40 p-2">
          {item.alternatives.map((alt, index) => {
            const altMacros = itemMacros(alt);
            return (
              <div key={index} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded bg-card px-3 py-1.5">
                <div className="flex min-w-[7rem] flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="inline-flex shrink-0 items-center gap-1 self-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-active">
                    {t("alternativeNumber", { number: index + 1 })}
                  </span>
                  <span className="min-w-0 max-w-full truncate text-sm font-medium text-ink" title={foodName(alt.food, locale)}>
                    {foodName(alt.food, locale)}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-muted">{t("quantityGrams", { value: displayGrams(alt.quantityGrams) })}</span>
                  {/* An alternative is a food the patient may be handed instead: it is checked like the item. */}
                  <div className="basis-full empty:hidden">
                    <AllergenNotice check={checks[alt.food.id]} nutrition={nutritionFor(alt.food.id, alt.quantityGrams)} compact />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium tabular-nums text-ink">{t("caloriesValue", { value: displayCalories(altMacros.calories) })}</span>
                  <button
                    type="button"
                    onClick={() => promoteAlternative(index)}
                    title={t("makeDefault")}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    {t("makeDefault")}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAlternative(index)}
                    className="text-ink-muted hover:text-danger"
                    aria-label={t("removeItem")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addingAlternative && (
        <div className="ms-6">
          <FoodAutocomplete onSelect={addAlternative} onCancel={() => setAddingAlternative(false)} />
        </div>
      )}
    </div>
  );
}
