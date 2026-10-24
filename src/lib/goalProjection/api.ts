import { type Fetcher, parseJson } from "@/lib/api";

/**
 * Phase 2, C: when could the patient reach their target weight? An ESTIMATE
 * (config/projection.php, provisional). The patient's own copy has no `inputs`
 * and no calorie number anywhere.
 */
export type ProjectionLevel = "high" | "medium" | "low";

export type ProjectionScenario = { level: ProjectionLevel; weeks: number | null; estimated_date: string | null; reachable: boolean };

export type GoalProjectionData = {
  remaining_kg: number;
  direction: "loss" | "gain";
  scenarios: ProjectionScenario[];
  current_level: ProjectionLevel | null;
  observed_weekly_change_kg: number | null;
  disclaimer_ar: string;
  /** Nutritionist only. */
  inputs: {
    current_weight_kg: number;
    target_weight_kg: number;
    maintenance_kcal: number;
    target_kcal: number;
    adherence_percent: number | null;
    weekly_change_full_kg: number;
  };
};

export type GoalProjectionResponse = { visible_to_patient: boolean; projection: GoalProjectionData | null };

export const getGoalProjection = (f: Fetcher, id: string | number) => f(`/clients/${id}/goal-projection`).then((r) => parseJson<GoalProjectionResponse>(r));

export const setGoalProjectionVisibility = (f: Fetcher, id: string | number, visible: boolean) =>
  f(`/clients/${id}/goal-projection-visibility`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible }),
  }).then((r) => parseJson<{ visible_to_patient: boolean }>(r));
