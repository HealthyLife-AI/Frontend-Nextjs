import { type Fetcher, parseJson } from "@/lib/api";
import type { Alert, AlertListResponse } from "./types";

/**
 * `is_read` is a real tri-state at the wire level: included true/false to
 * filter, or omitted entirely to get both — the backend does NOT default
 * an absent filter to unread-only (see IndexAlertRequest). Passing
 * `undefined` here must therefore omit the param, not send `is_read=`.
 */
export function listAlerts(
  fetcher: Fetcher,
  params: { is_read?: boolean; subscriber_id?: number; page?: number } = {}
) {
  const query = new URLSearchParams();
  // "1"/"0", not "true"/"false" — Laravel's `boolean` validation rule
  // (IndexAlertRequest) accepts true/false/0/1/'0'/'1' but NOT the
  // strings 'true'/'false', so String(bool) here 422s every time. Caught
  // by actually driving this page in a browser, not by tsc/lint/build.
  if (params.is_read !== undefined) query.set("is_read", params.is_read ? "1" : "0");
  if (params.subscriber_id !== undefined) query.set("subscriber_id", String(params.subscriber_id));
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const qs = query.toString();

  return fetcher(`/alerts${qs ? `?${qs}` : ""}`).then((res) => parseJson<AlertListResponse>(res));
}

export function markAlertRead(fetcher: Fetcher, id: number) {
  return fetcher(`/alerts/${id}/read`, { method: "PATCH" }).then((res) => parseJson<Alert>(res));
}
