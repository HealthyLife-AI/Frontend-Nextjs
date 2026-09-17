/**
 * Mirrors `GET /clients/{id}/progress` in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md — that file is the binding
 * contract; keep this in sync with it, never the other way around.
 */

import type { AdherenceStatus, MeasurementSource } from "@/lib/clients/types";

/**
 * The summary's own `status` is always one of the three — the backend
 * classifies every client on every call. `AdherenceStatus` includes null
 * because `subscribers.adherence_status` is null until the first
 * recompute; that's a stored column, not this response.
 */
export type AdherenceDirection = NonNullable<AdherenceStatus>;

export type AdherenceSummary = {
  from: string;
  to: string;
  total_logs: number;
  on_plan_logs: number;
  off_plan_logs: number;
  /** Null — not 0 — when nothing was logged at all (FR-18). */
  adherence_percent: number | null;
  previous: { from: string; to: string; adherence_percent: number | null };
  /** Percentage POINTS versus the preceding window; null with nothing to compare. */
  change_pp: number | null;
  status: AdherenceDirection;
  /** FR-30: shown beside the rate as context, never as a pass/fail line. */
  reference_percent: number;
};

export type WeightTrendPoint = {
  recorded_at: string;
  weight_kg: number;
  source: MeasurementSource;
};

export type CompositionSnapshot = {
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

/** The metrics `change` can carry — a first-to-last delta per metric. */
export type CompositionMetric =
  | "weight_kg"
  | "body_fat_percent"
  | "muscle_mass_kg"
  | "water_percent"
  | "waist_cm"
  | "hip_cm"
  | "thigh_cm"
  | "arm_cm";

/**
 * `planned_calories` is null, never 0, on a day with nothing to compare
 * against (no active plan, or a weekly plan with no meals that weekday).
 * `logged_calories` counts everything eaten, on-plan or not (BR-9).
 */
export type DailyCalories = {
  date: string;
  planned_calories: number | null;
  logged_calories: number;
};

export type ProgressResponse = {
  /** Oldest → newest, ready to plot. */
  weight_trend: WeightTrendPoint[];
  body_composition: {
    latest: CompositionSnapshot | null;
    previous: CompositionSnapshot | null;
    /** Null when the window holds fewer than two readings. */
    change: Partial<Record<CompositionMetric, number>> | null;
  };
  adherence: AdherenceSummary;
  /** One row per day in the window, oldest → newest, no gaps. */
  daily_calories: DailyCalories[];
};
