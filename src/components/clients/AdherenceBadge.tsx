"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { AdherenceStatus } from "@/lib/clients/types";

const TONES = {
  stable: "success",
  declining: "warning",
  stopped_logging: "danger",
} as const;

/**
 * BR-14: the label states a direction, never a verdict on the client.
 * `stable` is deliberately "success"-toned even when the underlying rate
 * is modest — holding steady is not a problem to flag, and the rate
 * itself is shown as context elsewhere (AdherenceHeadline), not here.
 */
export function AdherenceBadge({ status }: { status: AdherenceStatus }) {
  const t = useTranslations("adherence");

  if (status === null) {
    return <Badge tone="neutral">{t("none")}</Badge>;
  }

  return <Badge tone={TONES[status]}>{t(status)}</Badge>;
}
