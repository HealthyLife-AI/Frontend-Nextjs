import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 1, E: a patient's structured request. The nutritionist's list adds whose it is. */
export const QUICK_REASONS = ["special_occasion", "food_unavailable", "craving", "cannot_continue", "other"] as const;
export type QuickReason = (typeof QUICK_REASONS)[number];
export type QuickRequestStatus = "open" | "answered" | "closed";

export type QuickRequest = {
  id: number;
  reason: QuickReason;
  note: string | null;
  occasion_date: string | null;
  status: QuickRequestStatus;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  subscriber_id?: number;
  subscriber_name?: string;
  subscriber_code?: string;
};

export type QuickRequestPage = { data: QuickRequest[]; meta: { total: number; current_page: number; last_page: number } };

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/** All the nutritionist's patients' requests (paginated); `meta.total` is the sidebar count. */
export const listQuickRequests = (f: Fetcher, status?: QuickRequestStatus) =>
  f(`/quick-requests${status ? `?status=${status}` : ""}`).then((r) => parseJson<QuickRequestPage>(r));

/** One patient's history, newest first, every status (a plain array). */
export const listClientQuickRequests = (f: Fetcher, subscriberId: string | number) =>
  f(`/clients/${subscriberId}/quick-requests`).then((r) => parseJson<QuickRequest[]>(r));

export const respondToQuickRequest = (f: Fetcher, id: number, response: string) =>
  f(`/quick-requests/${id}/respond`, json("POST", { response })).then((r) => parseJson<QuickRequest>(r));

export const closeQuickRequest = (f: Fetcher, id: number) => f(`/quick-requests/${id}/close`, json("POST")).then((r) => parseJson<QuickRequest>(r));
