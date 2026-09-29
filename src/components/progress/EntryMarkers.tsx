"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";

/**
 * The marks a patient's own entry can carry for the nutritionist: "entered
 * late" (BR-19, more than 7 days after its date). Informational only — a
 * marked entry counts like any other — so it uses the neutral/attention
 * badge tones, never the error one, and always says it in words.
 */
export function EntryMarkers({ late }: { late: boolean }) {
  const t = useTranslations("progress.markers");

  if (!late) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {late && (
        <span title={t("lateHint")}>
          <Badge tone="warning">{t("late")}</Badge>
        </span>
      )}
    </span>
  );
}
