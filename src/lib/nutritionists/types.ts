/**
 * Mirrors `GET|PUT /me/nutritionist-profile` in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md (S4-00 / FR-28).
 */

/** PRD §8 leaves the tier scheme unfrozen — stored as a plain string. */
export type PlanTier = "basic" | "professional";

export type NutritionistGender = "male" | "female";

export type NutritionistProfile = {
  id: number;
  specialty: string | null;
  clinic_name: string | null;
  /** Shown to the nutritionist's own patients in the app: how it addresses them. */
  gender: NutritionistGender | null;
  /** E.164 with the leading + (e.g. +970599123456); shown to patients as their contact. */
  whatsapp_number: string | null;
  /** Free text shown to patients, e.g. «الأحد–الخميس 9–5». */
  reply_hours: string | null;
  /** Shown to the nutritionist's patients on the app's "my nutritionist" card. */
  bio: string | null;
  /**
   * Read-only here by design (BR-12): the dashboard shows the current
   * tier, billing sets it. The update request rejects it outright rather
   * than letting a nutritionist promote themselves by adding a field.
   */
  plan_tier: PlanTier | null;
  updated_at: string | null;
};

/** Exactly the fields UpdateNutritionistProfileRequest accepts. */
export type NutritionistProfileInput = {
  specialty: string | null;
  clinic_name: string | null;
  gender: NutritionistGender | null;
  whatsapp_number: string | null;
  reply_hours: string | null;
  bio: string | null;
};

/** E.164, the backend's own rule (NutritionistProfile::WHATSAPP_PATTERN): + then 8–15 digits, first not 0. */
export const WHATSAPP_PATTERN = /^\+[1-9]\d{7,14}$/;
