"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { ClientStatus } from "@/lib/clients/types";

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const t = useTranslations("clientStatus");

  return <Badge tone={status === "active" ? "success" : "neutral"}>{t(status)}</Badge>;
}
