import { type Fetcher, parseJson } from "@/lib/api";
import type { Food } from "@/lib/clients/types";
import type { AllergenConflict, FoodAllergenCheck, MealPlan, MealPlanInput, PlanActivityInput } from "./types";

// Re-exported for the components that already import it from here.
export type { ApiError } from "@/lib/api";

export function listMealPlans(fetcher: Fetcher, subscriberId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans`).then((res) => parseJson<MealPlan[]>(res));
}

export function getMealPlan(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}`).then((res) => parseJson<MealPlan>(res));
}

export function createMealPlan(fetcher: Fetcher, subscriberId: number | string, payload: MealPlanInput) {
  return fetcher(`/clients/${subscriberId}/meal-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<MealPlan>(res));
}

/** Full replace (PRD F-4: edited as one whole form) — same shape as createMealPlan. */
export function updateMealPlan(
  fetcher: Fetcher,
  subscriberId: number | string,
  planId: number | string,
  payload: MealPlanInput
) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<MealPlan>(res));
}

/**
 * BR-6/BR-10: the only way a plan (hand-built or AI draft) becomes what the
 * client sees.
 *
 * A plan holding a food that conflicts with a CONFIRMED allergy answers 422
 * `allergen_conflict_unacknowledged` (with `allergen_conflicts`) until
 * `acknowledge` is true — the nutritionist's explicit "I reviewed this and
 * keep it". Intolerances and foods to avoid never block.
 */
export function activateMealPlan(
  fetcher: Fetcher,
  subscriberId: number | string,
  planId: number | string,
  acknowledge = false
) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(acknowledge ? { acknowledge_allergen_conflicts: true } : {}),
  }).then((res) => parseJson<MealPlan>(res));
}

/** The 422 body of a refused activation: the code and the conflicts to show. */
export type AllergenRefusal = { code?: string; allergen_conflicts?: AllergenConflict[] };

/**
 * Record that she reviewed the confirmed-allergy conflicts on an ACTIVE plan
 * and keeps them. Does not re-activate (activated_at is unchanged) and
 * notifies nobody.
 */
export function acknowledgeAllergens(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/acknowledge-allergens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acknowledge_allergen_conflicts: true }),
  }).then((res) => parseJson<MealPlan>(res));
}

/** The server's own allergen rules for foods not yet in a plan. Read-only. */
export function checkFoodAllergens(fetcher: Fetcher, subscriberId: number | string, foodIds: number[]) {
  return fetcher(`/clients/${subscriberId}/meal-plans/allergen-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food_ids: foodIds }),
  }).then((res) => parseJson<{ foods: FoodAllergenCheck[] }>(res));
}

/**
 * The same check with the quantity the food would be planned at, so a high
 * glycemic index of a small amount (low glycemic load) is not flagged.
 * Each answer echoes its `quantity_grams`.
 */
export function checkFoodAllergensWithQuantity(
  fetcher: Fetcher,
  subscriberId: number | string,
  items: { food_id: number; quantity_grams: number }[]
) {
  return fetcher(`/clients/${subscriberId}/meal-plans/allergen-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((res) => parseJson<{ foods: (FoodAllergenCheck & { quantity_grams: number | null })[] }>(res));
}

/**
 * Item C: her approved target and summary alone, without resubmitting
 * the meals and without re-activating. Valid on the ACTIVE plan too —
 * neither field reaches the patient, so BR-6 is not in play. Sending
 * approved_calories: null clears it back to the system suggestion.
 */
export function updatePlanDecision(
  fetcher: Fetcher,
  subscriberId: number | string,
  planId: number | string,
  payload: { approved_calories?: number | null; plan_summary?: string | null; patient_instructions?: string | null; activities?: PlanActivityInput[] }
) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<MealPlan>(res));
}

/**
 * Item E: a new DRAFT for the same patient holding this plan's meals and
 * her decision. The source is untouched, and nothing reaches the patient
 * until the copy is activated in its own right (BR-6).
 */
export function duplicateMealPlan(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/duplicate`, { method: "POST" }).then((res) =>
    parseJson<MealPlan>(res)
  );
}

export type SummarySuggestion = {
  suggested_summary: string;
  suggested_approved_calories: number | null;
  /** True when the model was unavailable or its reply was rejected: the first line only. */
  is_fallback: boolean;
  /** Why: not_configured | provider_failed | empty | rejected_length | rejected_digit | macro_label. Null when the model's note was used. */
  fallback_reason: string | null;
};

/**
 * Item D: a suggested summary for her to edit. Saves nothing — the
 * normal Save button does that. Every number in the text is the
 * server's own, computed from the plan.
 */
export function suggestPlanSummary(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/summary-suggestion`, { method: "POST" }).then((res) =>
    parseJson<SummarySuggestion>(res)
  );
}

/**
 * F-5 (PRD, P1): "Suggest a starting plan" — rule-based, always returns
 * a draft. `approvedCalories` is the figure typed into the decision card
 * but not saved yet, so the draft is built to the number she is
 * deciding on rather than the one already stored.
 */
export function generateAiDraft(fetcher: Fetcher, subscriberId: number | string, approvedCalories?: number | null) {
  // `warnings`: "pending_allergy_proposal" while a patient-proposed allergy awaits approval.
  return fetcher(`/clients/${subscriberId}/meal-plans/ai-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvedCalories ? { approved_calories: approvedCalories } : {}),
  }).then((res) => parseJson<MealPlan & { warnings?: string[] }>(res));
}

/** `name` is optional — see `MealPlan.name`'s note on why only a template ever has one. */
export function saveMealPlanAsTemplate(
  fetcher: Fetcher,
  subscriberId: number | string,
  planId: number | string,
  name?: string | null
) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/save-as-template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || null }),
  }).then((res) => parseJson<MealPlan>(res));
}

/**
 * S3-03 / FR-15: this nutritionist's own reusable templates. Templates
 * carry no `subscriber_id` — isolation runs through `created_by`, so
 * there is no client id to pass here.
 */
export function listMealPlanTemplates(fetcher: Fetcher) {
  return fetcher("/meal-plan-templates").then((res) => parseJson<MealPlan[]>(res));
}

/**
 * Clones a template into a brand-new DRAFT plan for one client — it is
 * never active on arrival (BR-6/BR-10), so the caller still has to open
 * and activate it. Returns that new plan, whose `id` is what to navigate
 * to.
 */
export function applyMealPlanTemplate(
  fetcher: Fetcher,
  templateId: number | string,
  subscriberId: number | string
) {
  return fetcher(`/meal-plan-templates/${templateId}/apply/${subscriberId}`, { method: "POST" }).then((res) =>
    parseJson<MealPlan>(res)
  );
}

export type FoodSearchResponse = { data: Food[] };

/** FR-25: prefix match on either language. `q` must be at least 2 characters. */
export function searchFoods(fetcher: Fetcher, q: string) {
  return fetcher(`/foods/search?q=${encodeURIComponent(q)}&per_page=10`).then((res) =>
    parseJson<FoodSearchResponse>(res)
  );
}
