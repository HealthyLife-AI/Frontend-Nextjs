import type { Alert } from "@/lib/alerts/types";

/**
 * Alert `message` is written by the backend's rule engine
 * (`AlertEvaluationService`) as a fixed English sentence — alerts are
 * rule-based, not AI-generated, and run from a scheduled job with no
 * request locale to follow. Rather than show that English text on the
 * Arabic dashboard, the frontend re-renders each alert from its `type`
 * plus the numbers inside the message, in the viewer's language.
 *
 * The three patterns below mirror the backend's `sprintf` templates
 * exactly. If one ever changes there, the parse misses and the alert
 * falls back to its raw message — degraded (English) but never wrong or
 * blank.
 */
const PATTERNS = {
  no_log: /No meal logged in (\d+)\+ days\./,
  calories_exceeded: /Daily calorie target exceeded for (\d+) consecutive days\./,
  milestone: /Milestone: ([\d.]+)kg (lost|gained) over the last (\d+) days\./,
} as const;

export type AlertMessageTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

export function localizedAlertMessage(alert: Pick<Alert, "type" | "message">, t: AlertMessageTranslator): string {
  if (alert.type === "no_log") {
    const m = alert.message.match(PATTERNS.no_log);
    if (m) return t("noLog", { days: Number(m[1]) });
  }

  if (alert.type === "calories_exceeded") {
    const m = alert.message.match(PATTERNS.calories_exceeded);
    if (m) return t("caloriesExceeded", { days: Number(m[1]) });
  }

  if (alert.type === "milestone") {
    const m = alert.message.match(PATTERNS.milestone);
    if (m) {
      return t(m[2] === "lost" ? "milestoneLost" : "milestoneGained", { kg: m[1], days: Number(m[3]) });
    }
  }

  return alert.message;
}
