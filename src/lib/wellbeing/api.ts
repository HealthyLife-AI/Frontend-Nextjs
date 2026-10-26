import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 4, C3: a patient's daily sleep / stress / mood and its 14-day summary (nutritionist side). */
export type WellbeingLog = {
  date: string;
  sleep_hours: number | null;
  sleep_quality: "good" | "ok" | "poor" | null;
  stress: "low" | "medium" | "high" | null;
  mood: "good" | "ok" | "low" | null;
  note: string | null;
};

export type WellbeingSummary = {
  from: string;
  to: string;
  days: number;
  logged_days: number;
  sleep_logged_nights: number;
  avg_sleep_hours: number | null;
  nights_under_6h: number;
  top_stress: "low" | "medium" | "high" | null;
  top_mood: "good" | "ok" | "low" | null;
};

export type WellbeingResponse = { logs: WellbeingLog[]; summary: WellbeingSummary };

export const getWellbeing = (f: Fetcher, id: string | number) => f(`/clients/${id}/wellbeing`).then((r) => parseJson<WellbeingResponse>(r));
