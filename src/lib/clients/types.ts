/**
 * Mirrors the shapes documented in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md — keep in sync with that
 * file, not the other way around (it's the binding contract).
 */

export type ClientGoal = "weight_loss" | "weight_gain" | "weight_maintenance" | "health_monitoring";

/** The 7 structured goals (B10): what the nutritionist picks when adding a patient. */
export const GOAL_TYPES = ["weight_loss", "weight_gain", "muscle_gain", "weight_maintenance", "health_energy", "medical_condition", "other"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

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

/**
 * BR-17: what the patient last accepted of the privacy policy, as the
 * nutritionist sees it (no IP or user agent). Only on the single-patient
 * response, not the roster.
 */
export type ClientConsent = {
  accepted_version: string | null;
  accepted_at: string | null;
  /** The version in force (always set: the server falls back to a default). */
  current_version: string;
  /** false when never accepted or the accepted version is old. */
  up_to_date: boolean;
};

export type Client = {
  id: number;
  code: string;
  name: string;
  phone: string | null;
  /** What the patient signs in with; null for patients added before usernames. */
  username: string | null;
  goal: ClientGoal;
  /** The structured goal (7 types); null for a patient without one yet. */
  goal_type: GoalType | null;
  status: ClientStatus;
  /** Set while follow-up is ended ("إنهاء المتابعة"); records stay, read-only. */
  archived_at: string | null;
  adherence_status: AdherenceStatus;
  last_logged_at: string | null;
  created_at: string;
  /** Present on `GET /clients/{id}` only. */
  consent?: ClientConsent;
  /** Present on the roster (`GET /clients`) only: proposals awaiting approval. */
  pending_proposals_count?: number;
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
  /** Patients whose follow-up ended — left out of every count above. */
  archived: number;
  /** Booked appointments today (clinic time zone). */
  appointments_today: number;
  /** Profile proposals awaiting approval across followed-up patients. */
  pending_proposals: number;
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
  /** Allergen groups (FoodTagger::GROUPS) and shopping-list section. */
  allergens?: string[];
  shopping_section?: string;
};
