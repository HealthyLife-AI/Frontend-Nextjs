/**
 * Mirrors the shapes documented in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md ("Meal Plans (Sprint 3)"
 * section) — keep in sync with that file, not the other way around.
 */
import type { Food } from "@/lib/clients/types";

export type MealName = "breakfast" | "snack" | "lunch" | "dinner";

export type MealPlanStatus = "draft" | "active" | "archived";

export type Macros = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MealItem = {
  id: number;
  food: Food;
  quantity_grams: number;
  macros: Macros;
  /** BR-4: this item's permitted substitutes. Empty for an alternative itself — alternatives don't nest further. */
  alternatives: MealItem[];
};

export type Meal = {
  id: number;
  name: MealName;
  day_index: number | null;
  macros: Macros;
  /** Planned items only — see MealItem.alternatives for their substitutes. */
  items: MealItem[];
};

export type MealPlan = {
  id: number;
  subscriber_id: number | null;
  is_template: boolean;
  is_ai_draft: boolean;
  /**
   * Only ever set on a template — a hand-built client plan has one
   * audience already and doesn't need to be told apart from another
   * (see the `meal_plans` migration). Null there by design, not a gap.
   */
  name: string | null;
  start_date: string | null;
  status: MealPlanStatus;
  /**
   * When the plan was activated — i.e. when the client could first
   * follow it, as opposed to `created_at` (when it was drafted). Null on
   * a draft. Also what the backend uses to decide which days a plan was
   * in force in the plan-vs-actual series.
   */
  activated_at: string | null;
  meals: Meal[];
  summary_by_day: Record<string, Macros>;
  created_at: string;
  updated_at: string;
};

/**
 * The shape `StoreMealPlanRequest`/`UpdateMealPlanRequest` accept — a
 * planned item with its alternatives nested under it, not a flat list
 * with a `parent_item_id` the caller would have to invent (see the
 * backend request class's own docblock for why).
 */
export type MealItemInput = { food_id: number; quantity_grams: number };

export type MealInput = {
  name: MealName;
  day_index: number | null;
  items: { food_id: number; quantity_grams: number; alternatives: MealItemInput[] }[];
};

export type MealPlanInput = {
  start_date?: string | null;
  meals: MealInput[];
};
