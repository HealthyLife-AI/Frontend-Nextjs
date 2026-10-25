import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 3, B4: what the patient sees this morning. Read-only. No calorie numbers anywhere in it. */
export type TodaySummary = {
  date: string;
  meals: { name: string; name_ar: string; window: string }[];
  activities: { title: string; duration_minutes: number; times_per_day: number }[];
  reminders: { type: string; text_ar: string }[];
  motivation_ar?: string;
};

export const getTodaySummary = (f: Fetcher, id: string | number) => f(`/clients/${id}/today`).then((r) => parseJson<TodaySummary>(r));
