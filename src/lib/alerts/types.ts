/**
 * Mirrors `GET /alerts` / `PATCH /alerts/{id}/read` in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md — that file is the binding
 * contract; keep this in sync with it, never the other way around.
 */

export type AlertType = "no_log" | "calories_exceeded" | "milestone";

export type Alert = {
  id: number;
  subscriber_id: number;
  subscriber_name: string;
  subscriber_code: string;
  type: AlertType;
  message: string;
  is_read: boolean;
  /**
   * `false`, never `null`, for a `milestone` alert too — it has no
   * ongoing condition to resolve. An open/resolved tag must key off
   * `type`, not this field, or a one-shot positive event reads as a
   * still-open problem.
   */
  is_resolved: boolean;
  created_at: string;
};

export type AlertListResponse = {
  data: Alert[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};
