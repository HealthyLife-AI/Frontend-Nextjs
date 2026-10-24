import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 1, B: how often this patient is due to record body measurements. `null` = none set. */
export type MeasurementSchedule = {
  interval_days: number;
  next_due_on: string;
  is_overdue: boolean;
  days_overdue: number;
  last_reminded_on: string | null;
};

export const SCHEDULE_PRESETS = [7, 14, 30] as const;
export const SCHEDULE_MIN_DAYS = 3;
export const SCHEDULE_MAX_DAYS = 90;

export const getMeasurementSchedule = (f: Fetcher, id: string | number) =>
  f(`/clients/${id}/measurement-schedule`).then((r) => parseJson<MeasurementSchedule | null>(r));

/** `next_due_on` omitted = today + interval. */
export const saveMeasurementSchedule = (f: Fetcher, id: string | number, body: { interval_days: number; next_due_on?: string }) =>
  f(`/clients/${id}/measurement-schedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => parseJson<MeasurementSchedule>(r));

export const removeMeasurementSchedule = async (f: Fetcher, id: string | number) =>
  (await f(`/clients/${id}/measurement-schedule`, { method: "DELETE" })).ok;
