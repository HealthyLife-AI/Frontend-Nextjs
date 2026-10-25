import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 2, A: the periodic check-in. Nutritionist side. */
export type CheckinSettings = { interval_days: number | null; next_due_on: string | null };

export type CheckinAnswerLine = { key: string; label: string; value: string; flagged: boolean };

export type Checkin = {
  id: number;
  due_on: string;
  status: "pending" | "submitted" | "expired";
  submitted_at: string | null;
  flagged: boolean;
  reviewed_at: string | null;
  answers: Record<string, unknown> | null;
  /** The answers in the clinic's own Arabic words, one line per answered question. */
  answers_display: CheckinAnswerLine[];
  questionnaire_version: number | null;
};

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/** `null` when no settings were ever set. */
export const getCheckinSettings = (f: Fetcher, id: string | number) =>
  f(`/clients/${id}/checkin-settings`).then((r) => parseJson<CheckinSettings | null>(r));

/** `next_due_on` omitted = today. A due date of today opens the first check-in at once. */
export const saveCheckinSettings = (f: Fetcher, id: string | number, body: { interval_days: 7 | 14; next_due_on?: string }) =>
  f(`/clients/${id}/checkin-settings`, json("PUT", body)).then((r) => parseJson<CheckinSettings>(r));

export const removeCheckinSettings = async (f: Fetcher, id: string | number) => (await f(`/clients/${id}/checkin-settings`, { method: "DELETE" })).ok;

export const listCheckins = (f: Fetcher, id: string | number) => f(`/clients/${id}/checkins`).then((r) => parseJson<Checkin[]>(r));

export const reviewCheckin = (f: Fetcher, id: string | number, checkinId: number) =>
  f(`/clients/${id}/checkins/${checkinId}/review`, json("POST")).then((r) => parseJson<Checkin>(r));
