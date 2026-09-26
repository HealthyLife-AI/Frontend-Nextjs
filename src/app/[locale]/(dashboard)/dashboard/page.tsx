"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, ArrowLeft, Bell, CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { DashboardStatTiles } from "@/components/clients/DashboardStatTiles";
import { getDashboardOverview, listClients } from "@/lib/clients/api";
import { listAlerts } from "@/lib/alerts/api";
import type { Client, DashboardOverview } from "@/lib/clients/types";
import type { Alert } from "@/lib/alerts/types";
import { localizedAlertMessage } from "@/lib/alerts/message";

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
  const tAlertMessage = useTranslations("alerts.message");
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
      {/*
        Welcome banner in the landing page's hero language: deep-teal
        gradient, soft mint glow, the headline counts in plain words, and
        the two actions this screen leads to. Numbers come from the same
        requests the panels below use — nothing new is fetched for it.
      */}
      <section className="relative overflow-hidden rounded-panel bg-gradient-to-br from-mkt-teal-deep via-mkt-teal-cta to-mkt-dark-bg p-6 text-white shadow-brand sm:p-8">
        <div className="pointer-events-none absolute -top-24 end-[-4rem] h-72 w-72 rounded-full bg-mkt-mint/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 start-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" aria-hidden="true" />
              {t("heroEyebrow")}
            </span>
            {/* AppShell only renders this page once status === "authenticated", so user is never null here. */}
            <h1 className="text-2xl font-extrabold leading-tight sm:text-[32px]">{t("greeting", { name: user!.name })}</h1>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              {needsAttention && alerts && needsAttention.length + alerts.length === 0
                ? t("heroAllClear")
                : t("heroSummary", { attention: needsAttention?.length ?? "…", alerts: alerts?.length ?? "…" })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/dashboard/patients/new"
              className="inline-flex h-11 items-center gap-2 rounded-field bg-white px-5 text-sm font-bold text-mkt-teal-deep shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Plus size={18} strokeWidth={2.2} />
              {t("actionAddPatient")}
            </Link>
            <Link
              href="/dashboard/alerts"
              className="inline-flex h-11 items-center gap-2 rounded-field border border-white/30 bg-white/10 px-5 text-sm font-bold backdrop-blur transition-colors hover:bg-white/20"
            >
              {t("actionAlerts")}
              <ArrowLeft size={17} strokeWidth={2.2} className="ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {overview && <DashboardStatTiles overview={overview} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-status-attention-bg text-status-attention"><AlertTriangle size={18} strokeWidth={1.9} /></span>
              {t("needsAttentionTitle")}
            </h2>
            <Link href="/dashboard/patients" className="rounded-full bg-canvas px-3 py-1 text-xs font-bold text-mkt-teal-deep transition-colors hover:bg-mkt-mint-bg">
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
              className="flex items-center justify-between gap-3 rounded-field p-3 transition-colors hover:bg-mkt-mint-bg/60"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mkt-mint-bg to-mkt-sky/40 text-sm font-bold text-mkt-teal-deep ring-1 ring-mkt-mint-border/60">
                  {client.name.charAt(0)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-ink">{client.name}</span>
                  <span className="truncate text-xs text-ink-muted">{tGoals(client.goal)}</span>
                </div>
              </div>
              <AdherenceBadge status={client.adherence_status} />
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-2 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-mkt-mint-bg text-mkt-teal-deep"><Bell size={18} strokeWidth={1.9} /></span>
              {t("alertsTitle")}
            </h2>
            <Link href="/dashboard/alerts" className="rounded-full bg-canvas px-3 py-1 text-xs font-bold text-mkt-teal-deep transition-colors hover:bg-mkt-mint-bg">
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
              className="flex flex-col gap-1 rounded-field border-s-[3px] border-s-status-attention/60 bg-canvas/60 p-3 transition-colors hover:bg-mkt-mint-bg/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{alert.subscriber_name}</span>
                <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-ink-muted">{tAlertType(alert.type)}</span>
              </div>
              <span className="truncate text-xs text-ink-muted">{localizedAlertMessage(alert, tAlertMessage)}</span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
