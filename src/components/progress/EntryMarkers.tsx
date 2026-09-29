"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";

/**
 * The marks a patient's own entry can carry for the nutritionist: "entered
 * late" (BR-19, more than 7 days after its date) and "edited" (BR-15, the
 * patient changed it after saving it). Informational only — a marked entry
 * counts like any other — so neither uses the error tone, and both say it in
 * words, not only in color.
 */
export function EntryMarkers({ late, editedAt }: { late: boolean; editedAt: string | null }) {
  const t = useTranslations("progress.markers");

  if (!late && editedAt === null) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {late && (
        <span title={t("lateHint")}>
          <Badge tone="warning">{t("late")}</Badge>
        </span>
      )}
      {editedAt !== null && (
        <span title={t("editedHint", { date: editedAt.slice(0, 10) })}>
          <Badge tone="neutral">{t("edited")}</Badge>
        </span>
      )}
    </span>
  );
}

/** Whether a reading carries any mark (and so is listed under the chart). */
export function isMarked(entry: { is_late: boolean; edited_at: string | null }): boolean {
  return entry.is_late || entry.edited_at !== null;
}
