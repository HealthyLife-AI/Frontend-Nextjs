"use client";

import { useTranslations } from "next-intl";
import { Users, ShieldCheck, TrendingDown, CalendarX, BellOff } from "lucide-react";
import { StatTile } from "./StatTile";
import type { DashboardOverview } from "@/lib/clients/types";

/**
 * The five overview tiles, shared by the Home overview and the Patients
 * roster — extracted so the two screens can't drift into two different
 * tile sets for the same numbers. Deliberately used on both: Home asks
 * "who needs me today" and Patients is the full roster, but the
 * headline counts are the same counts either way.
 */
export function DashboardStatTiles({ overview }: { overview: DashboardOverview }) {
  const t = useTranslations("clients.stats");

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatTile icon={Users} value={overview.total} label={t("total")} tone="primary" />
      <StatTile icon={ShieldCheck} value={overview.stable} label={t("stable")} tone="success" />
      <StatTile icon={TrendingDown} value={overview.declining} label={t("declining")} tone="warning" />
      <StatTile icon={CalendarX} value={overview.stopped_logging} label={t("stoppedLogging")} tone="danger" />
      <StatTile icon={BellOff} value={overview.not_logged_today} label={t("notLoggedToday")} tone="primary" />
    </div>
  );
}
