import { Coffee, Cookie, Moon, Sun, Sunrise, type LucideIcon } from "lucide-react";
import type { Food } from "@/lib/clients/types";
import type { Macros, MealInput, MealName, MealPlan } from "@/lib/mealPlans/types";

/**
 * The approved Stitch reference (design-reference/.../nutricare_2, "مصمم
 * الخطة الغذائية") shows five meal cards: breakfast, morning snack,
 * lunch, afternoon snack, dinner — two "snack" slots, not one. The
 * backend's `meals.name` enum only has a single `snack` value (PRD F-4:
 * "breakfast, snack, lunch, dinner") — nothing stops two meal rows both
 * named `snack` in the same plan, so this UI imposes a fixed 5-slot
 * layout on top of that 4-value enum via a client-only `slotKey`, saved
 * and reloaded by array position (see `planToSlots`/`slotsToInput`)
 * rather than needing a 5th backend value.
 *
 * The mockup also shows a suggested time window per meal ("07:30-08:30
 * صباحاً") — there's no `time_slot` column in this app's `meals` table
 * (S3-01 only shipped `name`/`day_index`/`sort_order`), so that hint
 * here is a fixed, cosmetic default per slot, not a per-plan value
 * pretending to be something the nutritionist actually set.
 */
export type SlotKey = "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner";

export const MEAL_SLOTS: { slotKey: SlotKey; name: MealName; icon: LucideIcon }[] = [
  { slotKey: "breakfast", name: "breakfast", icon: Sunrise },
  { slotKey: "morning_snack", name: "snack", icon: Coffee },
  { slotKey: "lunch", name: "lunch", icon: Sun },
  { slotKey: "afternoon_snack", name: "snack", icon: Cookie },
  { slotKey: "dinner", name: "dinner", icon: Moon },
];

export type EditableItem = {
  /** Present once saved server-side; absent for an item added in this editing session. */
  id?: number;
  food: Food;
  quantityGrams: number;
  alternatives: EditableItem[];
};

export type EditableMeal = {
  slotKey: SlotKey;
  name: MealName;
  icon: LucideIcon;
  items: EditableItem[];
};

export function emptySlots(): EditableMeal[] {
  return MEAL_SLOTS.map(({ slotKey, name, icon }) => ({ slotKey, name, icon, items: [] }));
}

/**
 * Reconciles a saved plan's meals (ordered, real `food` objects already
 * embedded per `MealItemResource`) back onto the fixed 5 slots — by
 * matching `name` in order, not by index alone, so a plan saved with
 * fewer than 5 meals (an AI draft that found no viable food for one
 * slot, or an older plan) still lands on the right cards instead of
 * shifting everything after a gap.
 */
export function planToSlots(plan: MealPlan | null): EditableMeal[] {
  const slots = emptySlots();
  if (!plan) return slots;

  const remaining = [...plan.meals];

  for (const slot of slots) {
    const index = remaining.findIndex((m) => m.name === slot.name);
    if (index === -1) continue;

    const [matched] = remaining.splice(index, 1);
    slot.items = matched.items.map(toEditableItem);
  }

  return slots;
}

function toEditableItem(item: MealPlan["meals"][number]["items"][number]): EditableItem {
  return {
    id: item.id,
    food: item.food,
    quantityGrams: item.quantity_grams,
    alternatives: item.alternatives.map((alt) => ({
      id: alt.id,
      food: alt.food,
      quantityGrams: alt.quantity_grams,
      alternatives: [],
    })),
  };
}

export function slotsToInput(slots: EditableMeal[]): MealInput[] {
  return slots
    .filter((slot) => slot.items.length > 0) // an empty card just isn't part of the plan
    .map((slot) => ({
      name: slot.name,
      day_index: null,
      items: slot.items.map((item) => ({
        food_id: item.food.id,
        quantity_grams: item.quantityGrams,
        alternatives: item.alternatives.map((alt) => ({
          food_id: alt.food.id,
          quantity_grams: alt.quantityGrams,
        })),
      })),
    }));
}

/** Client-side mirror of MealPlanCalculatorService — planned items only, same rule as the backend. */
export function itemMacros(item: EditableItem): Macros {
  const factor = item.quantityGrams / 100;
  return {
    calories: round1(item.food.calories_per_100g * factor),
    protein_g: round1(item.food.protein_g_per_100g * factor),
    carbs_g: round1(item.food.carbs_g_per_100g * factor),
    fat_g: round1(item.food.fat_g_per_100g * factor),
  };
}

export function mealMacros(meal: EditableMeal): Macros {
  return sumMacros(meal.items.map(itemMacros));
}

export function planMacros(slots: EditableMeal[]): Macros {
  return sumMacros(slots.map(mealMacros));
}

export function fiberGrams(slots: EditableMeal[]): number {
  return round1(
    slots
      .flatMap((slot) => slot.items)
      .reduce((sum, item) => sum + ((item.food.fiber_g_per_100g ?? 0) * item.quantityGrams) / 100, 0)
  );
}

function sumMacros(rows: Macros[]): Macros {
  return {
    calories: round1(rows.reduce((s, r) => s + r.calories, 0)),
    protein_g: round1(rows.reduce((s, r) => s + r.protein_g, 0)),
    carbs_g: round1(rows.reduce((s, r) => s + r.carbs_g, 0)),
    fat_g: round1(rows.reduce((s, r) => s + r.fat_g, 0)),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
