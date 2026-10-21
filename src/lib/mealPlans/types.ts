/**
 * Mirrors the shapes documented in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md ("Meal Plans (Sprint 3)"
 * section) — keep in sync with that file, not the other way around.
 */
import type { CalorieSuggestion, Food } from "@/lib/clients/types";

export type MealName = "breakfast" | "snack" | "lunch" | "dinner";

export type MealPlanStatus = "draft" | "active" | "archived";

/**
 * Pilot feedback 2, A. How strongly a food conflicts with what the patient
 * is APPROVED to avoid: only a confirmed allergy blocks an activation.
 */
export type AllergenSeverity = "confirmed_allergy" | "intolerance" | "avoid";

export type AllergenConflict = {
  meal_id: number;
  meal_name: string;
  day_index: number | null;
  item_id: number;
  /** Set when this is an ALTERNATIVE of that planned item. */
  parent_item_id: number | null;
  food_id: number;
  food_name_ar: string | null;
  groups: string[];
  /** "tag": the food's own allergen tags; "text": an "other" allergy's wording found in its name (a hint, not a proof). */
  match: "tag" | "text";
  severity: AllergenSeverity;
};

/** A food whose allergens were never tagged: unknown, which is not the same as safe. */
export type UnverifiedItem = { item_id: number; food_id: number; food_name_ar: string | null };

/**
 * Clinical batch 1, E4: a glycemic or sodium warning for a REVIEWED food.
 * Amber, never blocking. `gi_gl` = both the index and the load are high.
 */
export type NutritionWarning = {
  type: "gi" | "gl" | "gi_gl" | "sodium";
  item_id: number;
  parent_item_id: number | null;
  food_id: number;
  food_name_ar: string | null;
  quantity_grams: number;
  gi?: number;
  gl?: number | null;
  sodium_mg_per_100g?: number;
};

/** The food-level part of the same warnings (the picker has no quantity yet). */
export type FoodNutritionWarning = { type: "gi"; gi: number } | { type: "sodium"; sodium_mg_per_100g: number };

/** One food against the patient's approved allergies (POST …/allergen-check). */
export type FoodAllergenCheck = {
  food_id: number;
  conflict: { groups: string[]; match: "tag" | "text"; severity: AllergenSeverity } | null;
  unverified: boolean;
  nutrition_warnings?: FoodNutritionWarning[];
};

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
  /** true when the rule-based calorie fit produced this draft, not the model. Nutritionist responses only. */
  is_ai_fallback?: boolean;
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
  /**
   * Item C, nutritionist responses only — the patient's own
   * GET /me/meal-plan carries none of these four. `plan_summary` is
   * sensitive health data: never log it, never send it onward.
   */
  approved_calories?: number | null;
  /** What the formula said when this plan was activated, frozen for the history. */
  suggested_calories?: number | null;
  plan_summary?: string | null;
  summary_updated_at?: string | null;
  /** Clinical batch 1, B5: how the system's suggestion was reached. Null on an archived plan or a template. */
  calorie_suggestion?: CalorieSuggestion | null;
  /** Clinical batch 1, E4: glycemic / sodium warnings, reviewed foods only. */
  nutrition_warnings?: NutritionWarning[];
  /**
   * Pilot feedback 2, A. Nutritionist responses only — the patient's own
   * GET /me/meal-plan carries none of these. Absent on a template or an
   * archived plan, which are not checked.
   */
  allergen_conflicts?: AllergenConflict[];
  unverified_items?: UnverifiedItem[];
  /** An ACTIVE plan holds a confirmed-allergy conflict its acknowledgement does not cover. */
  new_unacknowledged_conflicts?: boolean;
  allergen_ack_at?: string | null;
  /**
   * Clinical batch 1, D: written FOR the patient, so — unlike plan_summary
   * above — the patient's own GET /me/meal-plan carries it, and it prints.
   */
  patient_instructions?: string | null;
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
  /** Item C: sent with the plan so one save records the meals and the decision together. */
  approved_calories?: number | null;
  plan_summary?: string | null;
  patient_instructions?: string | null;
  meals: MealInput[];
};
