/**
 * Mirrors `GET|PUT /me/nutritionist-profile` in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md (S4-00 / FR-28).
 */

/** PRD §8 leaves the tier scheme unfrozen — stored as a plain string. */
export type PlanTier = "basic" | "professional";

export type NutritionistProfile = {
  id: number;
  specialty: string | null;
  clinic_name: string | null;
  bio: string | null;
  /**
   * Read-only here by design (BR-12): the dashboard shows the current
   * tier, billing sets it. The update request rejects it outright rather
   * than letting a nutritionist promote themselves by adding a field.
   */
  plan_tier: PlanTier | null;
  updated_at: string | null;
};

/** Exactly the three fields UpdateNutritionistProfileRequest accepts. */
export type NutritionistProfileInput = {
  specialty: string | null;
  clinic_name: string | null;
  bio: string | null;
};
