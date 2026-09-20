import { type Fetcher, parseJson } from "@/lib/api";
import type { Food } from "@/lib/clients/types";
import type { MealPlan, MealPlanInput } from "./types";

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

/** BR-6/BR-10: the only way a plan (hand-built or AI draft) becomes what the client sees. */
export function activateMealPlan(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/activate`, { method: "POST" }).then((res) =>
    parseJson<MealPlan>(res)
  );
}

/** F-5 (PRD, P1): "Suggest a starting plan" — rule-based, always returns a draft. */
export function generateAiDraft(fetcher: Fetcher, subscriberId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/ai-draft`, { method: "POST" }).then((res) =>
    parseJson<MealPlan>(res)
  );
}

export function saveMealPlanAsTemplate(fetcher: Fetcher, subscriberId: number | string, planId: number | string) {
  return fetcher(`/clients/${subscriberId}/meal-plans/${planId}/save-as-template`, { method: "POST" }).then((res) =>
    parseJson<MealPlan>(res)
  );
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
