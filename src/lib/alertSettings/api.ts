import { type Fetcher, parseJson } from "@/lib/api";

/**
 * Pilot feedback 2, B: per-patient alert thresholds. Every override is a
 * number or null; null means "the global default" (`defaults`).
 */
export const ALERT_SETTING_FIELDS = ["no_log_days", "calorie_exceeded_streak_days", "milestone_weight_change_kg", "milestone_window_days"] as const;
export type AlertSettingField = (typeof ALERT_SETTING_FIELDS)[number];

export type AlertSettingValues = Record<AlertSettingField, number>;
export type AlertSettingOverrides = Record<AlertSettingField, number | null>;

export type AlertSettings = {
  /** What applies to this patient right now: the override, else the default. */
  effective: AlertSettingValues;
  overrides: AlertSettingOverrides;
  defaults: AlertSettingValues;
};

/** The same bounds the API enforces, so the form can say so before a round trip. */
export const ALERT_SETTING_BOUNDS: Record<AlertSettingField, { min: number; max: number; step: number }> = {
  no_log_days: { min: 1, max: 14, step: 1 },
  calorie_exceeded_streak_days: { min: 1, max: 14, step: 1 },
  milestone_weight_change_kg: { min: 0.5, max: 20, step: 0.5 },
  milestone_window_days: { min: 7, max: 90, step: 1 },
};

export const getAlertSettings = (f: Fetcher, subscriberId: number | string) =>
  f(`/clients/${subscriberId}/alert-settings`).then((r) => parseJson<AlertSettings>(r));

/** Any subset; null resets that field to the default, an absent field is left alone. */
export const saveAlertSettings = (f: Fetcher, subscriberId: number | string, values: Partial<AlertSettingOverrides>) =>
  f(`/clients/${subscriberId}/alert-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  }).then((r) => parseJson<AlertSettings>(r));
