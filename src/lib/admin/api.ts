import { type Fetcher, parseJson } from "@/lib/api";
import type { CatalogFood, FoodInput, FoodPage, FoodStatus } from "@/lib/foods/api";

/** What the 06:00 job (adherence refresh + alerts) did on its last run. */
export type DailyRun = {
  ran_at: string;
  patients: number;
  status_changes: number;
  failures: number;
  stable: number;
  declining: number;
  stopped_logging: number;
};

/** A `*_set: false` value is a default the API fell back to; nothing is blocked by it. */
export type ConsentConfiguration = {
  version: string;
  version_set: boolean;
  policy_url: string | null;
  policy_url_set: boolean;
};

export type AdminOverview = {
  nutritionists: number;
  clients: number;
  active_clients: number;
  foods_total: number;
  foods_pending: number;
  foods_by_source: { usda: number; admin: number; nutritionist: number };
  /** null until the 06:00 job has run once. */
  last_daily_run: DailyRun | null;
  /** BR-17: the consent values in force and whether each was set in the environment. */
  consent: ConsentConfiguration;
};

export type AdminNutritionist = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  clinic_name: string | null;
  /** ISO code: decides which country's food costs they read. */
  country: string;
  clients_count: number;
  active_clients_count: number;
  created_at: string | null;
};

export type AdminNutritionistPage = {
  /** The countries a nutritionist can be set to (code => Arabic name): one list, from the server. */
  countries: Record<string, string>;
  data: AdminNutritionist[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export type FoodSource = "usda" | "admin" | "nutritionist";

/** Foods still waiting for a reviewer: no glycemic index (where one applies), no sodium, or no tags. */
export type FoodMissingFilter = "glycemic_index" | "sodium" | "tags";

export function getAdminOverview(fetcher: Fetcher) {
  return fetcher("/admin/overview").then((res) => parseJson<AdminOverview>(res));
}

export function listAdminNutritionists(fetcher: Fetcher, params: { q?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return fetcher(`/admin/nutritionists${qs ? `?${qs}` : ""}`).then((res) => parseJson<AdminNutritionistPage>(res));
}

export function listAdminFoods(
  fetcher: Fetcher,
  params: { q?: string; status?: FoodStatus | ""; source?: FoodSource | ""; missing?: FoodMissingFilter | ""; page?: number }
) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.source) query.set("source", params.source);
  if (params.missing) query.set("missing", params.missing);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return fetcher(`/admin/foods${qs ? `?${qs}` : ""}`).then((res) => parseJson<FoodPage>(res));
}

export function createAdminFood(fetcher: Fetcher, payload: FoodInput) {
  return fetcher("/admin/foods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<CatalogFood>(res));
}

/** How many meal plans and client logs use a food (sent with a 409 `food_in_use_confirm` / `food_in_use`). */
export type FoodUsage = { meal_plans: number; meal_logs: number };

/**
 * The first save of a food that plans or logs already use comes back 409
 * `food_in_use_confirm` with its usage; resend with `confirmInUse` once
 * the admin has agreed.
 */
export function updateAdminFood(fetcher: Fetcher, id: number, payload: FoodInput, confirmInUse = false) {
  return fetcher(`/admin/foods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(confirmInUse ? { ...payload, confirm_in_use: true } : payload),
  }).then((res) => parseJson<CatalogFood>(res));
}

export function deleteAdminFood(fetcher: Fetcher, id: number) {
  return fetcher(`/admin/foods/${id}`, { method: "DELETE" }).then((res) =>
    parseJson<null>(res)
  );
}

export function setNutritionistCountry(fetcher: Fetcher, id: number, country: string) {
  return fetcher(`/admin/nutritionists/${id}/country`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
  }).then((res) => parseJson<{ id: number; country: string }>(res));
}

/** A food's cost tier in any country; `null` clears that country's value. Returns the food with its regional rows. */
export function setRegionalCost(fetcher: Fetcher, foodId: number, country: string, costTier: string | null) {
  return fetcher(`/admin/foods/${foodId}/regional-costs/${country}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cost_tier: costTier }),
  }).then((res) => parseJson<CatalogFood>(res));
}

export function approveFood(fetcher: Fetcher, id: number) {
  return fetcher(`/foods/${id}/approve`, { method: "POST" }).then((res) => parseJson<CatalogFood>(res));
}

export function rejectFood(fetcher: Fetcher, id: number) {
  return fetcher(`/foods/${id}/reject`, { method: "POST" }).then((res) => parseJson<CatalogFood>(res));
}
