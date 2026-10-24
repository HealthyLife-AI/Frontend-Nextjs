"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Bell, CalendarX, ClipboardCheck, Flame, Award, Check, MessageSquareMore, Ruler } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { listAlerts, markAlertRead } from "@/lib/alerts/api";
import type { Alert, AlertSeverity, AlertType } from "@/lib/alerts/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { localizedAlertMessage } from "@/lib/alerts/message";
import { listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

const FILTERS = [
  { labelKey: "filterAll", is_read: undefined },
  { labelKey: "filterUnread", is_read: false },
  { labelKey: "filterRead", is_read: true },
] as const;

const SEVERITY_FILTERS = [
  { labelKey: "filterSeverityAll", severity: undefined },
  { labelKey: "filterImportant", severity: "important" },
  { labelKey: "filterNormal", severity: "normal" },
] as const;

const TYPE_ICON: Record<AlertType, typeof CalendarX> = {
  no_log: CalendarX,
  calories_exceeded: Flame,
  milestone: Award,
  measurement_overdue: Ruler,
  quick_request: MessageSquareMore,
};

/** Same tint used for the icon chip and the leading dot elsewhere on this screen. */
const TYPE_TONE: Record<AlertType, "danger" | "warning" | "success"> = {
  no_log: "danger",
  calories_exceeded: "warning",
  milestone: "success",
  measurement_overdue: "warning",
  quick_request: "warning",
};

/**
 * S5-08: wires the sidebar's "Alerts" nav item (scaffolded in Sprint 1)
 * to real data. Roster-wide, not per-client — `subscriber_name`/`code` on
 * each row link back to that client's profile, since an alert with only
 * an id is not actionable.
 *
 * Same structural pattern as `patients/page.tsx`: state is the URL
 * (filter, page), fetched client-side via `authorizedFetch`.
 */
export default function AlertsPage() {
  const t = useTranslations("alerts");
  const { authorizedFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isReadParam = searchParams.get("is_read");
  const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const severityParam = searchParams.get("severity");
  const severity: AlertSeverity | undefined = severityParam === "important" || severityParam === "normal" ? severityParam : undefined;

  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    listAlerts(authorizedFetch, { is_read: isRead, severity, page }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setAlerts(result.data.data);
        setMeta(result.data.meta);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, isRead, severity, page]);

  function navigate(next: { is_read?: boolean; severity?: AlertSeverity; page?: number }) {
    const query: Record<string, string> = {};
    if (next.is_read !== undefined) query.is_read = String(next.is_read);
    if (next.severity !== undefined) query.severity = next.severity;
    if (next.page && next.page > 1) query.page = String(next.page);

    router.push({ pathname: "/dashboard/alerts", query });
  }

  async function handleMarkRead(id: number) {
    // Optimistic: the row's own state flips immediately, no refetch —
    // the list the user is looking at shouldn't reshuffle under them.
    setAlerts((current) => current?.map((a) => (a.id === id ? { ...a, is_read: true } : a)) ?? null);

    const result = await markAlertRead(authorizedFetch, id);
    if (!result.ok) {
      // Revert on failure — better than silently claiming it worked.
      setAlerts((current) => current?.map((a) => (a.id === id ? { ...a, is_read: false } : a)) ?? null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <PendingProposalsRow />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.labelKey}
            type="button"
            onClick={() => navigate({ is_read: filter.is_read, severity })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              filter.is_read === isRead
                ? "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand"
                : "border border-border bg-card text-ink-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            {t(filter.labelKey)}
          </button>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-divider sm:block" aria-hidden="true" />
        {/* Phase 1, C3: by importance. The server already lists important ones first. */}
        {SEVERITY_FILTERS.map((filter) => (
          <button
            key={filter.labelKey}
            type="button"
            onClick={() => navigate({ is_read: isRead, severity: filter.severity })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              filter.severity === severity
                ? "bg-status-late text-white shadow-brand"
                : "border border-border bg-card text-ink-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

        {!loading && alerts?.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-panel border border-border/70 bg-card py-16 text-center shadow-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={22} strokeWidth={1.75} />
            </div>
            <p className="max-w-xs text-sm text-ink-muted">
              {isRead === undefined && severity === undefined ? t("emptyHint") : t("noResults")}
            </p>
          </div>
        )}

        {!loading && alerts?.map((alert) => <AlertRow key={alert.id} alert={alert} onMarkRead={handleMarkRead} />)}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between rounded-panel border border-border/70 bg-card px-4 py-3 shadow-panel">
          <span className="text-sm text-ink-muted">{meta.total}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => navigate({ is_read: isRead, severity, page: meta.current_page - 1 })}
              className="rounded-field px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {t("previousPage")}
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => navigate({ is_read: isRead, severity, page: meta.current_page + 1 })}
              className="rounded-field px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {t("nextPage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert, onMarkRead }: { alert: Alert; onMarkRead: (id: number) => void }) {
  const t = useTranslations("alerts");
  const tAlertMessage = useTranslations("alerts.message");
  const format = useFormatter();
  const Icon = TYPE_ICON[alert.type];
  const tone = TYPE_TONE[alert.type];
  // A milestone has no ongoing condition to resolve — is_resolved reads
  // false for it same as an open problem, so the tag is type-gated, not
  // field-gated (see lib/alerts/types.ts).
  const showsResolution = alert.type !== "milestone";

  return (
    <div
      className={`flex items-start gap-3 rounded-panel border border-border/70 bg-card p-4 shadow-panel ${
        alert.is_read ? "opacity-70" : ""
      } ${alert.severity === "important" ? "border-s-[3px] border-s-status-late" : ""}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-field ${
          tone === "danger"
            ? "bg-status-late-bg text-status-late"
            : tone === "warning"
              ? "bg-status-attention-bg text-status-attention"
              : "bg-status-on-track-bg text-status-on-track"
        }`}
      >
        <Icon size={20} strokeWidth={1.75} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/patients/${alert.subscriber_id}`}
            className="text-sm font-semibold text-ink hover:text-primary hover:underline"
          >
            {alert.subscriber_name}
          </Link>
          <span className="text-xs text-ink-muted">{alert.subscriber_code}</span>
          {alert.severity === "important" && <Badge tone="danger">{t("severityImportant")}</Badge>}
          <Badge tone="primary">{t(`type.${alert.type}`)}</Badge>
          {showsResolution && (
            <Badge tone={alert.is_resolved ? "neutral" : "warning"}>
              {alert.is_resolved ? t("resolvedTag") : t("open")}
            </Badge>
          )}
        </div>
        <p className="text-sm text-ink-muted">{localizedAlertMessage(alert, tAlertMessage)}</p>
        <span className="text-xs text-ink-muted/80">{format.dateTime(new Date(alert.created_at), { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" })}</span>
      </div>

      {!alert.is_read && (
        <button
          type="button"
          onClick={() => onMarkRead(alert.id)}
          className="flex shrink-0 items-center gap-1.5 rounded-field border border-border px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <Check size={14} strokeWidth={2} />
          {t("markRead")}
        </button>
      )}
    </div>
  );
}

/**
 * «بانتظار الاعتماد»: patients whose own goal / medication / allergy changes
 * wait for the nutritionist. Not an alert row (nothing to mark read): it
 * disappears once every proposal is approved or rejected on the patient page.
 */
function PendingProposalsRow() {
  const t = useTranslations("alerts.proposals");
  const { authorizedFetch } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    listClients(authorizedFetch, { pendingProposals: true }).then((r) => {
      if (r.ok) setClients(r.data.data);
    });
  }, [authorizedFetch]);

  if (clients.length === 0) return null;

  return (
    <section id="proposals" className="flex flex-col gap-3 rounded-panel border border-status-attention/30 bg-status-attention-bg p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
        <ClipboardCheck size={18} className="text-status-attention" aria-hidden="true" />
        {t("title")}
      </h2>
      <ul className="flex flex-col gap-2">
        {clients.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-field bg-card px-3 py-2">
            <span className="min-w-0 truncate text-sm">
              <span className="font-semibold text-ink">{c.name}</span> <span className="text-xs text-ink-muted">{c.code}</span>
            </span>
            <Link href={`/dashboard/patients/${c.id}`} className="shrink-0 text-xs font-bold text-mkt-teal-deep hover:underline">
              {t("review", { count: c.pending_proposals_count ?? 0 })}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}