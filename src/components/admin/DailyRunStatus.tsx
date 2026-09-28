"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CalendarCheck } from "lucide-react";
import type { DailyRun } from "@/lib/admin/api";

/** A run older than this means the 06:00 job didn't run this morning. */
const STALE_AFTER_MS = 26 * 60 * 60 * 1000;

/**
 * Proof on the admin overview that the 06:00 job ran: when, how many
 * patients it checked and how many adherence statuses it changed. Turns
 * into a warning when there's no run in the last day, which on Taqat means
 * neither cron nor the self-trigger has run it (see DEPLOYMENT.md).
 */
export function DailyRunStatus({ run }: { run: DailyRun | null }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const ranAt = run ? new Date(run.ran_at) : null;
  // Read once at render: this component re-renders with each overview load.
  // eslint-disable-next-line react-hooks/purity
  const stale = !ranAt || Date.now() - ranAt.getTime() > STALE_AFTER_MS;

  const when = ranAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(ranAt)
    : null;

  if (stale) {
    return (
      <p role="status" className="flex items-start gap-2.5 rounded-field bg-status-attention-bg px-4 py-3 text-sm text-ink">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-attention" />
        <span>{when ? t("dailyRunStale", { when }) : t("dailyRunNever")}</span>
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2.5 text-sm text-ink-muted">
      <CalendarCheck size={17} className="shrink-0 text-primary" />
      <span>
        {t("dailyRunOk", {
          when: when ?? "",
          patients: run!.patients,
          changes: run!.status_changes,
        })}
        {run!.failures > 0 && <span className="ms-1.5 font-semibold text-status-late">{t("dailyRunFailures", { count: run!.failures })}</span>}
      </span>
    </p>
  );
}
