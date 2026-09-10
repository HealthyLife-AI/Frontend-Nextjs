import type { Food } from "@/lib/clients/types";
import type { MealPlan, MealPlanInput } from "./types";

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

export type ApiError = { message: string; errors?: Record<string, string[]> };

async function parseJson<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; error: ApiError; status: number }> {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, status: res.status, error: body ?? { message: "Something went wrong." } };
  }

  return { ok: true, data: body as T };
}

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

export type FoodSearchResponse = { data: Food[] };

/** FR-25: prefix match on either language. `q` must be at least 2 characters. */
export function searchFoods(fetcher: Fetcher, q: string) {
  return fetcher(`/foods/search?q=${encodeURIComponent(q)}&per_page=10`).then((res) =>
    parseJson<FoodSearchResponse>(res)
  );
}
