"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Repeat, Trash2 } from "lucide-react";
import type { Food } from "@/lib/clients/types";
import { FoodAutocomplete } from "./FoodAutocomplete";
import { itemMacros, type EditableItem } from "./mealSlots";

/**
 * One planned item and its permitted alternatives (BR-4), indented
 * beneath it exactly as the approved Stitch reference shows — nested
 * visually because that's the actual relationship, not a flat list with
 * a badge.
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

  function foodLabel(food: Food): string {
    return (locale === "ar" ? food.name_ar : food.name_en) ?? food.name_en ?? food.name_ar ?? "";
  }

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
    <div className="flex flex-col gap-1.5 rounded-control p-1">
      <div className="flex items-center justify-between rounded-control bg-canvas/60 px-3 py-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-ink">{foodLabel(item.food)}</span>
          <span className="ms-2 text-xs text-ink-muted">{t("quantityGrams", { value: item.quantityGrams })}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm font-medium text-ink">{t("caloriesValue", { value: macros.calories })}</span>
          <button
            type="button"
            onClick={() => setAddingAlternative(true)}
            className="inline-flex items-center gap-1 rounded bg-accent/15 px-2 py-1 text-xs font-medium text-accent-active hover:bg-accent/25"
          >
            <Repeat size={13} />
            {t("addAlternative")}
          </button>
          <button type="button" onClick={onRemove} className="text-ink-muted hover:text-danger" aria-label={t("removeItem")}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {item.alternatives.length > 0 && (
        <div className="ms-6 flex flex-col gap-1.5 rounded-control bg-canvas/40 p-2">
          {item.alternatives.map((alt, index) => {
            const altMacros = itemMacros(alt);
            return (
              <div key={index} className="flex items-center justify-between rounded bg-card px-3 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-active">
                    {t("alternativeNumber", { number: index + 1 })}
                  </span>
                  <span className="truncate text-sm font-medium text-ink">{foodLabel(alt.food)}</span>
                  <span className="shrink-0 text-xs text-ink-muted">{t("quantityGrams", { value: alt.quantityGrams })}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium text-ink">{t("caloriesValue", { value: altMacros.calories })}</span>
                  <button
                    type="button"
                    onClick={() => promoteAlternative(index)}
                    className="text-xs font-semibold text-primary hover:underline"
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
