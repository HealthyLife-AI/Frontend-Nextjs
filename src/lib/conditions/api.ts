import { type Fetcher, parseJson } from "@/lib/api";

/** Clinical batch 1, C: structured conditions (nutritionist only) and the ready-made patient tips. */

export type Condition = { id: number; code: string; label: string; other_text: string | null; note: string | null };
export type ConditionOption = { code: string; label: string };
export type ConditionsResponse = { data: Condition[]; available: ConditionOption[] };

export type PatientTips = {
  general: string[];
  conditions: { code: string; label: string; tips: string[] }[];
};

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const getConditions = (f: Fetcher, id: string | number) => f(`/clients/${id}/conditions`).then((r) => parseJson<ConditionsResponse>(r));

export const addCondition = (f: Fetcher, id: string | number, c: { code: string; other_text?: string | null; note?: string | null }) =>
  f(`/clients/${id}/conditions`, json("POST", c)).then((r) => parseJson<Condition>(r));

export const updateCondition = (f: Fetcher, id: string | number, conditionId: number, c: { code: string; other_text?: string | null; note?: string | null }) =>
  f(`/clients/${id}/conditions/${conditionId}`, json("PUT", c)).then((r) => parseJson<Condition>(r));

export const removeCondition = async (f: Fetcher, id: string | number, conditionId: number) =>
  (await f(`/clients/${id}/conditions/${conditionId}`, { method: "DELETE" })).ok;

export const getPatientTips = (f: Fetcher, id: string | number) => f(`/clients/${id}/patient-tips`).then((r) => parseJson<PatientTips>(r));
