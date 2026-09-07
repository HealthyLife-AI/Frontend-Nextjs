"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { AdherenceStatus } from "@/lib/clients/types";

export function AdherenceBadge({ status }: { status: AdherenceStatus }) {
  const t = useTranslations("adherence");

  if (status === null) {
    return <Badge tone="neutral">{t("none")}</Badge>;
  }

  const tone = status === "on_track" ? "success" : status === "needs_attention" ? "warning" : "danger";

  return <Badge tone={tone}>{t(status)}</Badge>;
}
