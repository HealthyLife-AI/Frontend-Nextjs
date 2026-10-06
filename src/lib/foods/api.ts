import type { Food } from "@/lib/clients/types";
import { type Fetcher, parseJson } from "@/lib/api";

export type FoodStatus = "approved" | "pending" | "rejected";

/** A catalog food as the API returns it, including review status. */
export type CatalogFood = Food & { status: FoodStatus };

export type FoodPage = {
  data: CatalogFood[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export type FoodInput = {
  name_ar: string | null;
  name_en: string | null;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  fiber_g_per_100g: number | null;
  /** Admin only: allergen groups and shopping-list section (never nutrition values). */
  allergens?: string[];
  shopping_section?: string;
};

export const FOOD_ALLERGENS = ["tree_nuts", "peanuts", "milk_lactose", "egg", "wheat_gluten", "sesame", "fish", "shellfish", "soy"] as const;
export const SHOPPING_SECTIONS = ["produce", "meat_poultry_fish", "dairy_eggs", "grains_starches", "legumes_nuts", "oils_spices", "other"] as const;

/** Approved catalog search (same endpoint the plan designer uses). */
export function searchCatalog(fetcher: Fetcher, q: string, page = 1) {
  return fetcher(`/foods/search?q=${encodeURIComponent(q)}&per_page=20&page=${page}`).then((res) =>
    parseJson<FoodPage>(res)
  );
}

/** Nutritionist: submit a local food for admin review (BR-5 — pending until approved). */
export function submitFood(fetcher: Fetcher, payload: FoodInput) {
  return fetcher("/foods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<CatalogFood>(res));
}

/** Nutritionist: their own submissions with review status. */
export function listMyFoods(fetcher: Fetcher, page = 1) {
  return fetcher(`/foods/mine?page=${page}`).then((res) => parseJson<FoodPage>(res));
}
