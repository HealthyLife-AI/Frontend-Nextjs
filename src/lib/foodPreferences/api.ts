import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 2, B: what a patient likes and dislikes (a soft preference, never an allergy). */
export type PreferredFood = {
  food_id: number;
  name_ar: string | null;
  name_en: string | null;
  /** Who added it. */
  source: "patient" | "nutritionist";
};

export type FoodPreferences = { likes: PreferredFood[]; dislikes: PreferredFood[] };

export const getFoodPreferences = (f: Fetcher, id: string | number) => f(`/clients/${id}/food-preferences`).then((r) => parseJson<FoodPreferences>(r));

/** The WHOLE list: what is left out is removed. A row kept unchanged keeps whoever added it. */
export const saveFoodPreferences = (f: Fetcher, id: string | number, body: { likes: number[]; dislikes: number[] }) =>
  f(`/clients/${id}/food-preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => parseJson<FoodPreferences>(r));
