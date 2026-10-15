/**
 * Item C: the soft floor the plan designer warns below.
 *
 * PROVISIONAL, pending the nutritionists' own input (B14) — mirrors
 * config/nutrition.php on the backend, where the same caveat is written
 * out in full. A warning only: approving a lower target is a clinical
 * decision and nothing here blocks it.
 */
export const CALORIE_FLOOR: Record<"female" | "male", number> = {
  female: 1200,
  male: 1500,
};
