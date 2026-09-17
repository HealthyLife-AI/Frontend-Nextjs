/**
 * Mirrors the shapes documented in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md — keep in sync with that
 * file, not the other way around (it's the binding contract).
 */

export type ClientGoal = "weight_loss" | "weight_gain" | "weight_maintenance" | "health_monitoring";

export type ClientStatus = "pending" | "active";

/**
 * BR-14 / S4-03: a DIRECTION, not a level. Both interviewed nutritionists
 * said a percentage on its own is not what prompts intervention, so the
 * backend reclassified these from on_track/needs_attention/late — a
 * client steady at a modest rate raises nothing, while one who fell from
 * 85% to 72% is surfaced despite sitting above the reference. `null`
 * means not computed yet, which is distinct from any of the three.
 */
export type AdherenceStatus = "stable" | "declining" | "stopped_logging" | null;

export type Client = {
  id: number;
  code: string;
  name: string;
  phone: string | null;
  goal: ClientGoal;
  status: ClientStatus;
  adherence_status: AdherenceStatus;
  last_logged_at: string | null;
  created_at: string;
};

export type ClientListResponse = {
  data: Client[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export type DashboardOverview = {
  total: number;
  active: number;
  pending: number;
  /** Same three direction states as `AdherenceStatus` — see its note. */
  stable: number;
  declining: number;
  stopped_logging: number;
  not_logged_today: number;
};

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type Gender = "male" | "female";

export type Medication = {
  name: string;
  dose?: string;
  schedule?: string;
};

export type HealthProfile = {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  health_conditions: string[];
  medications: Medication[];
  allergies: string[];
  food_preferences: string[];
  surgery_history: string | null;
  lab_notes: string | null;
  nutritionist_notes: string | null;
  daily_calorie_needs: number | null;
  updated_at: string;
};

/**
 * BR-13 / S4-16: `source` records which instrument produced the reading.
 * A clinic analyser and a client's own tape measure end up in the same
 * series, so the nutritionist must always be able to tell them apart —
 * never render a reading without it.
 *
 * Body fat, muscle mass and water come off an analyser and are
 * nutritionist-only (BR-11); a remote client submits weight and the four
 * circumferences alone, so those three are null on a self-reported row.
 */
export type MeasurementSource = "clinic-analyser" | "self-reported";

export type BodyCompositionReading = {
  id: number;
  recorded_at: string;
  source: MeasurementSource;
  weight_kg: number;
  body_fat_percent: number | null;
  muscle_mass_kg: number | null;
  water_percent: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
};

export type Food = {
  id: number;
  name_en: string | null;
  name_ar: string | null;
  source: "usda" | "admin" | "nutritionist";
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  fiber_g_per_100g: number | null;
};
