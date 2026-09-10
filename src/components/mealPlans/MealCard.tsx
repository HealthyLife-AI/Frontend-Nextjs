"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import type { Food } from "@/lib/clients/types";
import { FoodAutocomplete } from "./FoodAutocomplete";
import { MealItemRow } from "./MealItemRow";
import { mealMacros, type EditableItem, type EditableMeal } from "./mealSlots";

/**
 * S3-09: one meal slot — header (icon, name, cosmetic suggested time,
 * live total) and its planned items. Ported from the approved Stitch
 * reference (design-reference/.../nutricare_2), recolored to the PRD's
 * tokens.
 */
export function MealCard({ meal, onChange }: { meal: EditableMeal; onChange: (next: EditableMeal) => void }) {
  const t = useTranslations("planDesigner");
  const tMeals = useTranslations("planDesigner.mealSlots");
  const [addingItem, setAddingItem] = useState(false);
  const Icon = meal.icon;

  function addItem(food: Food, quantityGrams: number) {
    onChange({ ...meal, items: [...meal.items, { food, quantityGrams, alternatives: [] }] });
    setAddingItem(false);
  }

  function updateItem(index: number, next: EditableItem) {
    onChange({ ...meal, items: meal.items.map((item, i) => (i === index ? next : item)) });
  }

  function removeItem(index: number) {
    onChange({ ...meal, items: meal.items.filter((_, i) => i !== index) });
  }

  const totalCalories = mealMacros(meal).calories;

  return (
    <article className="rounded-card border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between rounded-t-card bg-canvas/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-semibold text-ink">{tMeals(meal.slotKey)}</h2>
            <p className="text-xs text-ink-muted">{tMeals(`${meal.slotKey}Time`)}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-primary">
          {totalCalories} <span className="text-sm font-normal text-ink-muted">{t("kcal")}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {meal.items.map((item, index) => (
          <MealItemRow
            key={item.id ?? `new-${index}`}
            item={item}
            onChange={(next) => updateItem(index, next)}
            onRemove={() => removeItem(index)}
          />
        ))}

        {meal.items.length === 0 && !addingItem && (
          <p className="py-4 text-center text-sm text-ink-muted">{t("emptyMeal")}</p>
        )}

        {addingItem ? (
          <FoodAutocomplete onSelect={addItem} onCancel={() => setAddingItem(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAddingItem(true)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-control bg-canvas py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-canvas/70"
          >
            <Plus size={18} strokeWidth={1.75} />
            {tMeals(`${meal.slotKey}Add`)}
          </button>
        )}
      </div>
    </article>
  );
}
