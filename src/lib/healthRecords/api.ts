import { type Fetcher, parseJson } from "@/lib/api";

/** Mirrors API_CONTRACT.md "Health profile records & proposals (Phase 2, Step 1)". */

export const GOAL_TYPES = ["weight_loss", "weight_gain", "muscle_gain", "weight_maintenance", "health_energy", "medical_condition", "other"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];
export const ALLERGY_GROUPS = ["tree_nuts", "peanuts", "milk_lactose", "egg", "wheat_gluten", "sesame", "fish", "shellfish", "soy", "other"] as const;
export type AllergyGroup = (typeof ALLERGY_GROUPS)[number];
export const ALLERGY_CLASSES = ["confirmed_allergy", "intolerance", "avoid"] as const;
export type AllergyClass = (typeof ALLERGY_CLASSES)[number];
export const TIMINGS = ["before", "with", "after", "empty_stomach", "any"] as const;
export type Timing = (typeof TIMINGS)[number];

export type Goal = {
  goal_type: GoalType;
  target_weight_kg: number | null;
  target_date: string | null;
  activity_level: string | null;
  training_days_per_week: number | null;
  training_level: string | null;
  training_type: string | null;
  details: string | null;
};

export type Medication = {
  id: number;
  name: string;
  dose: string | null;
  frequency: string | null;
  timing: Timing;
  reason: string | null;
  status: "ongoing" | "until";
  until_date: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

export type Allergy = { id: number; group: AllergyGroup; other_text: string | null; label: string; class: AllergyClass; note: string | null };

export type Proposal = {
  id: number;
  kind: "goal" | "medication" | "allergy";
  action: "add" | "edit" | "remove";
  target_id: number | null;
  payload: Record<string, unknown> | null;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  decision_note: string | null;
  created_at: string;
};

export type HealthRecords = { goal: Goal | null; medications: Medication[]; allergies: Allergy[]; proposals: Proposal[] };

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const getHealthRecords = (f: Fetcher, id: string | number) => f(`/clients/${id}/health-records`).then((r) => parseJson<HealthRecords>(r));
export const saveGoal = (f: Fetcher, id: string | number, goal: Partial<Goal>) => f(`/clients/${id}/goal`, json("PUT", goal)).then((r) => parseJson<HealthRecords>(r));
export const addMedication = (f: Fetcher, id: string | number, m: Partial<Medication>) => f(`/clients/${id}/medications`, json("POST", m)).then((r) => parseJson<Medication>(r));
export const updateMedication = (f: Fetcher, id: string | number, medId: number, m: Partial<Medication>) =>
  f(`/clients/${id}/medications/${medId}`, json("PUT", m)).then((r) => parseJson<Medication>(r));
export const archiveMedication = async (f: Fetcher, id: string | number, medId: number) => (await f(`/clients/${id}/medications/${medId}`, { method: "DELETE" })).ok;
export const reviewMedication = (f: Fetcher, id: string | number, medId: number, note: string | null) =>
  f(`/clients/${id}/medications/${medId}/review`, json("POST", { note })).then((r) => parseJson<Medication>(r));
export const addAllergy = (f: Fetcher, id: string | number, a: Partial<Allergy>) => f(`/clients/${id}/allergies`, json("POST", a)).then((r) => parseJson<Allergy>(r));
export const removeAllergy = async (f: Fetcher, id: string | number, allergyId: number) => (await f(`/clients/${id}/allergies/${allergyId}`, { method: "DELETE" })).ok;
export const decideProposal = (f: Fetcher, id: string | number, proposalId: number, decision: "approve" | "reject", note: string | null) =>
  f(`/clients/${id}/proposals/${proposalId}/${decision}`, json("POST", { note })).then((r) => parseJson<Proposal>(r));