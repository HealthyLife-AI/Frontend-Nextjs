import { type Fetcher, parseJson } from "@/lib/api";

/**
 * Phase 3, C: why the weight moved between the two latest readings. The facts
 * are the server's arithmetic (nutritionist only); the text is a model's wording
 * of them, or a fixed fallback (`is_fallback`). The patient's own copy is just
 * the change and the text.
 */
export type InsightFacts = {
  change_kg: number;
  days: number;
  adherence_percent: number | null;
  logged_days: number;
  off_plan_meals: number;
  high_sodium_logs: number;
  checkins: { appetite: string | null; sleep: string | null; barriers: string[] } | null;
  likely_water_fluctuation: boolean;
  consistent_with_plan: boolean;
};

export type WeightInsightData = {
  from_date: string;
  to_date: string;
  change_kg: number;
  text_ar: string;
  is_fallback: boolean;
  /** Why the fixed text was used: not_configured | provider_failed | empty | rejected_digit | rejected_length | rejected_blocklist:<word>. Null for the model's own text. */
  fallback_reason: string | null;
  generated_at: string;
  facts: InsightFacts;
};

export type WeightInsightResponse = { visible_to_patient: boolean; insight: WeightInsightData | null };

export const getWeightInsight = (f: Fetcher, id: string | number) => f(`/clients/${id}/weight-insight`).then((r) => parseJson<WeightInsightResponse>(r));

export const regenerateWeightInsight = (f: Fetcher, id: string | number) =>
  f(`/clients/${id}/weight-insight/regenerate`, { method: "POST" }).then((r) => parseJson<WeightInsightResponse>(r));

export const setWeightInsightVisibility = (f: Fetcher, id: string | number, visible: boolean) =>
  f(`/clients/${id}/weight-insight-visibility`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible }),
  }).then((r) => parseJson<{ visible_to_patient: boolean }>(r));
