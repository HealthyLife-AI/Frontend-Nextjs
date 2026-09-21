"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { DashboardStatTiles } from "@/components/clients/DashboardStatTiles";
import { getDashboardOverview, listClients } from "@/lib/clients/api";
import { listAlerts } from "@/lib/alerts/api";
import type { Client, DashboardOverview } from "@/lib/clients/types";
import type { Alert } from "@/lib/alerts/types";

const RECENT_ALERTS_SHOWN = 5;
const NEEDS_ATTENTION_SHOWN = 6;

/**
 * Home answers a different question than Patients: not "show me
 * everyone" but "who needs me today" — unread alerts and clients whose
 * adherence is moving the wrong way, ahead of the full roster. Product
 * review flagged that a bare `/dashboard` -> `/dashboard/patients`
 * redirect made "Home" and "Patients" read as one destination with two
 * nav items; this replaces the redirect rather than adding a second one.
 *
 * Deliberately NOT the roster table again — every row here already
 * exists on Patients (filterable, paginated, searchable); repeating it
 * here would give this screen no reason to exist. The stat tiles ARE
 * shared with Patients on purpose (`DashboardStatTiles`) — same headline
 * counts, asked from a different angle.
 */
export default function DashboardHomePage() {
  const t = useTranslations("dashboardHome");
  const tAlertType = useTranslations("alerts.type");
  const tGoals = useTranslations("goals");
  const { authorizedFetch, user } = useAuth();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [needsAttention, setNeedsAttention] = useState<Client[] | null>(null);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboardOverview(authorizedFetch).then((result) => {
      if (!cancelled && result.ok) setOverview(result.data);
    });

    // Two calls, not one: ListClientsRequest's adherence filter takes a
    // single value, and "needs attention" spans two (declining and
    // stopped_logging) — merged here rather than asking the backend for
    // a filter shape only this screen would ever use.
    Promise.all([
      listClients(authorizedFetch, { adherence: "stopped_logging" }),
      listClients(authorizedFetch, { adherence: "declining" }),
    ]).then(([stopped, declining]) => {
      if (cancelled) return;
      const combined = [
        ...(stopped.ok ? stopped.data.data : []),
        ...(declining.ok ? declining.data.data : []),
      ];
      setNeedsAttention(combined.slice(0, NEEDS_ATTENTION_SHOWN));
    });

    listAlerts(authorizedFetch, { is_read: false }).then((result) => {
      if (!cancelled && result.ok) setAlerts(result.data.data.slice(0, RECENT_ALERTS_SHOWN));
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        {/* AppShell only renders this page once status === "authenticated", so user is never null here. */}
        <h1 className="text-2xl font-semibold text-ink">{t("greeting", { name: user!.name })}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {overview && <DashboardStatTiles overview={overview} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <AlertTriangle size={18} strokeWidth={1.75} className="text-status-attention" />
              {t("needsAttentionTitle")}
            </h2>
            <Link href="/dashboard/patients" className="text-xs font-medium text-primary hover:underline">
              {t("viewAll")}
            </Link>
          </div>

          {needsAttention === null && <p className="py-6 text-center text-sm text-ink-muted">…</p>}

          {needsAttention?.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 size={28} strokeWidth={1.75} className="text-status-on-track" />
              <p className="text-sm text-ink-muted">{t("needsAttentionEmpty")}</p>
            </div>
          )}

          {needsAttention?.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/patients/${client.id}`}
              className="flex items-center justify-between gap-3 rounded-control border border-divider p-2.5 transition-colors hover:bg-canvas"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {client.name.charAt(0)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-ink">{client.name}</span>
                  <span className="truncate text-xs text-ink-muted">{tGoals(client.goal)}</span>
                </div>
              </div>
              <AdherenceBadge status={client.adherence_status} />
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <Bell size={18} strokeWidth={1.75} className="text-primary" />
              {t("alertsTitle")}
            </h2>
            <Link href="/dashboard/alerts" className="text-xs font-medium text-primary hover:underline">
              {t("viewAll")}
            </Link>
          </div>

          {alerts === null && <p className="py-6 text-center text-sm text-ink-muted">…</p>}

          {alerts?.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 size={28} strokeWidth={1.75} className="text-status-on-track" />
              <p className="text-sm text-ink-muted">{t("alertsEmpty")}</p>
            </div>
          )}

          {alerts?.map((alert) => (
            <Link
              key={alert.id}
              href={`/dashboard/patients/${alert.subscriber_id}`}
              className="flex flex-col gap-0.5 rounded-control border border-divider p-2.5 transition-colors hover:bg-canvas"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{alert.subscriber_name}</span>
                <span className="shrink-0 text-xs text-ink-muted">{tAlertType(alert.type)}</span>
              </div>
              <span className="truncate text-xs text-ink-muted">{alert.message}</span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
