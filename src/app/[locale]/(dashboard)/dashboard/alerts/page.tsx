"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowRight,
  Award,
  Bell,
  CalendarX,
  Check,
  CheckCheck,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Flame,
  MessageSquareMore,
  Ruler,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUnreadAlerts } from "@/components/alerts/UnreadAlertsProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { useOpenRequests } from "@/components/quickRequests/OpenRequestsProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { listAlerts, markAlertRead, markAllAlertsRead } from "@/lib/alerts/api";
import { localizedAlertMessage } from "@/lib/alerts/message";
import type { Alert, AlertSeverity, AlertType } from "@/lib/alerts/types";
import { listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { formatListDateTime } from "@/lib/format/date";

const TYPE_ICON: Record<AlertType, LucideIcon> = {
  no_log: CalendarX,
  calories_exceeded: Flame,
  milestone: Award,
  measurement_overdue: Ruler,
  quick_request: MessageSquareMore,
  checkin_flag: ClipboardList,
  report_uploaded: FileText,
};

const TYPE_TONE: Record<AlertType, "danger" | "warning" | "success"> = {
  no_log: "danger",
  calories_exceeded: "warning",
  milestone: "success",
  measurement_overdue: "warning",
  quick_request: "warning",
  checkin_flag: "warning",
  report_uploaded: "warning",
};

const TONE_SQUARE: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-status-late-bg text-status-late-ink",
  warning: "bg-status-attention-bg text-status-attention-ink",
  success: "bg-status-on-track-bg text-status-on-track-ink",
};

type ReadFilter = "all" | "unread" | "read";
type SeverityFilter = "all" | AlertSeverity;
type Filters = { is_read?: boolean; severity?: AlertSeverity; subscriber_id?: number; page?: number };

/**
 * S5-08: the roster-wide alerts screen. State is the URL (read filter,
 * importance, patient, page), fetched client-side via `authorizedFetch`.
 *
 * Top to bottom: header with "mark all as read", three stat tiles (two set
 * filters, one links to the requests inbox), the pending-proposals band, one
 * filter bar, then the list grouped under «مهمة» / «عادية» — the API already
 * returns important alerts first, then newest, so consecutive rows of one
 * severity form a group.
 *
 * The header bell and the tiles read the same shared count
 * (UnreadAlertsProvider), refreshed after every mark-read.
 */
export default function AlertsPage() {
  const t = useTranslations("alerts");
  const { authorizedFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count: unreadCount, refresh: refreshUnread } = useUnreadAlerts();
  const { count: openRequests } = useOpenRequests();

  const isReadParam = searchParams.get("is_read");
  const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const severityParam = searchParams.get("severity");
  const severity: AlertSeverity | undefined = severityParam === "important" || severityParam === "normal" ? severityParam : undefined;
  const subscriberParam = Number(searchParams.get("subscriber_id") ?? "");
  const subscriberId = Number.isInteger(subscriberParam) && subscriberParam > 0 ? subscriberParam : undefined;

  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [importantUnread, setImportantUnread] = useState<number | null>(null);
  const [roster, setRoster] = useState<Client[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [markAllFailed, setMarkAllFailed] = useState(false);
  // Bumped to refetch the list in place (after "mark all").
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    listAlerts(authorizedFetch, { is_read: isRead, severity, subscriber_id: subscriberId, page }).then((result) => {
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
  }, [authorizedFetch, isRead, severity, subscriberId, page, reload]);

  const refreshCounts = useCallback(() => {
    refreshUnread();
    listAlerts(authorizedFetch, { is_read: false, severity: "important" }).then((r) => {
      if (r.ok) setImportantUnread(r.data.meta.total);
    });
  }, [authorizedFetch, refreshUnread]);

  useEffect(() => {
    refreshCounts();
    // The patient filter's options: the roster's first page (the API paginates it).
    listClients(authorizedFetch, {}).then((r) => {
      if (r.ok) setRoster(r.data.data);
    });
  }, [authorizedFetch, refreshCounts]);

  function navigate(next: Filters) {
    const query: Record<string, string> = {};
    if (next.is_read !== undefined) query.is_read = String(next.is_read);
    if (next.severity !== undefined) query.severity = next.severity;
    if (next.subscriber_id !== undefined) query.subscriber_id = String(next.subscriber_id);
    if (next.page && next.page > 1) query.page = String(next.page);

    router.push({ pathname: "/dashboard/alerts", query });
  }

  const current: Filters = { is_read: isRead, severity, subscriber_id: subscriberId };

  async function handleMarkRead(id: number) {
    // Optimistic: the row's own state flips immediately, no refetch —
    // the list the user is looking at shouldn't reshuffle under them.
    setAlerts((list) => list?.map((a) => (a.id === id ? { ...a, is_read: true } : a)) ?? null);

    const result = await markAlertRead(authorizedFetch, id);
    if (!result.ok) {
      // Revert on failure — better than silently claiming it worked.
      setAlerts((list) => list?.map((a) => (a.id === id ? { ...a, is_read: false } : a)) ?? null);
      return;
    }
    refreshCounts();
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    setMarkAllFailed(false);
    const result = await markAllAlertsRead(authorizedFetch, { severity, subscriber_id: subscriberId });
    setMarkingAll(false);

    if (!result.ok) {
      setMarkAllFailed(true);
      return;
    }
    setReload((n) => n + 1);
    refreshCounts();
  }

  const readValue: ReadFilter = isRead === undefined ? "all" : isRead ? "read" : "unread";
  const filtered = isRead !== undefined || severity !== undefined || subscriberId !== undefined;

  return (
    <PageContainer variant="list">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button type="button" variant="secondary" onClick={handleMarkAll} isLoading={markingAll} disabled={!unreadCount}>
            {!markingAll && <CheckCheck size={18} strokeWidth={1.9} aria-hidden="true" />}
            {t("markAllRead")}
          </Button>
        }
      />

      {markAllFailed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
          {t("markAllFailed")}
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
        <StatTile
          icon={Bell}
          tint="bg-primary/10 text-primary"
          value={unreadCount}
          label={t("filterUnread")}
          pressed={isRead === false && severity === undefined}
          onClick={() => navigate({ is_read: false, subscriber_id: subscriberId })}
        />
        <StatTile
          icon={TriangleAlert}
          tint="bg-status-late-bg text-status-late-ink"
          value={importantUnread}
          label={t("statImportantUnread")}
          pressed={isRead === false && severity === "important"}
          onClick={() => navigate({ is_read: false, severity: "important", subscriber_id: subscriberId })}
        />
        <StatTile icon={MessageSquareMore} tint="bg-status-attention-bg text-status-attention-ink" value={openRequests} label={t("statOpenRequests")} href="/dashboard/requests" />
      </div>

      <PendingProposalsRow />

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-panel border border-border/70 bg-card p-4 shadow-panel">
        <Segmented<ReadFilter>
          label={t("filterReadLabel")}
          value={readValue}
          onChange={(v) => navigate({ ...current, is_read: v === "all" ? undefined : v === "read" })}
          options={[
            { value: "all", label: t("filterAll") },
            { value: "unread", label: t("filterUnread") },
            { value: "read", label: t("filterRead") },
          ]}
        />
        {/* Phase 1, C3: by importance. The server already lists important ones first. */}
        <Segmented<SeverityFilter>
          label={t("filterSeverityLabel")}
          tone="ink"
          value={severity ?? "all"}
          onChange={(v) => navigate({ ...current, severity: v === "all" ? undefined : v })}
          options={[
            { value: "all", label: t("filterSeverityAll") },
            { value: "important", label: t("filterImportant"), idleClassName: "!text-status-late-ink" },
            { value: "normal", label: t("filterNormal") },
          ]}
        />
        <div className="ms-auto w-full min-w-0 sm:w-64">
          <Select
            label={t("filterPatient")}
            value={subscriberId === undefined ? "" : String(subscriberId)}
            onChange={(e) => navigate({ ...current, subscriber_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">{t("allPatients")}</option>
            {/* A patient picked from a link but beyond the roster's first page still shows as selected. */}
            {subscriberId !== undefined && !roster.some((c) => c.id === subscriberId) && <option value={subscriberId}>#{subscriberId}</option>}
            {roster.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.code}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

        {!loading && alerts?.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-panel border border-border/70 bg-card py-16 text-center shadow-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell size={22} strokeWidth={1.75} />
            </div>
            <p className="max-w-xs text-sm text-ink-muted">{filtered ? t("noResults") : t("emptyHint")}</p>
          </div>
        )}

        {!loading &&
          groupBySeverity(alerts ?? []).map((group) => (
            <section key={`${group.severity}-${group.alerts[0].id}`} className="flex flex-col gap-2.5">
              <h2 className={`flex items-center gap-2 text-sm font-bold ${group.severity === "important" ? "text-status-late-ink" : "text-ink"}`}>
                {group.severity === "important" && <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" />}
                {group.severity === "important" ? t("groupImportant") : t("groupNormal")}
              </h2>
              <ul className="divide-y divide-divider overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
                {group.alerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onMarkRead={handleMarkRead} />
                ))}
              </ul>
            </section>
          ))}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between rounded-panel border border-border/70 bg-card px-4 py-3 shadow-panel">
          <span className="text-sm text-ink-muted">{meta.total}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => navigate({ ...current, page: meta.current_page - 1 })}
              className="min-h-10 rounded-field px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:text-ink-muted/60 disabled:hover:bg-transparent"
            >
              {t("previousPage")}
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => navigate({ ...current, page: meta.current_page + 1 })}
              className="min-h-10 rounded-field px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:text-ink-muted/60 disabled:hover:bg-transparent"
            >
              {t("nextPage")}
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/** Consecutive rows of one severity become one group, in the order the API sent them. */
function groupBySeverity(alerts: Alert[]): { severity: AlertSeverity; alerts: Alert[] }[] {
  const groups: { severity: AlertSeverity; alerts: Alert[] }[] = [];
  for (const alert of alerts) {
    const last = groups[groups.length - 1];
    if (last && last.severity === alert.severity) last.alerts.push(alert);
    else groups.push({ severity: alert.severity, alerts: [alert] });
  }
  return groups;
}

/**
 * A count with a label. With `onClick` it is a filter button (`aria-pressed`
 * while that filter is on); with `href` it is a link, marked by an arrow that
 * points the reading direction.
 */
function StatTile({
  icon: Icon,
  tint,
  value,
  label,
  onClick,
  pressed,
  href,
}: {
  icon: LucideIcon;
  tint: string;
  value: number | null;
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  href?: string;
}) {
  const frame =
    "flex items-center gap-4 rounded-panel border bg-card p-5 text-start shadow-panel transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-panel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const body: ReactNode = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-3xl font-extrabold leading-tight tabular-nums text-ink">{value ?? "–"}</span>
        <span className="text-sm text-ink-muted">{label}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${frame} border-border/70`}>
        {body}
        <ArrowRight size={18} strokeWidth={1.9} className="shrink-0 text-ink-muted rtl:-scale-x-100" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={`${frame} ${pressed ? "border-primary/60" : "border-border/70"}`}>
      {body}
    </button>
  );
}

function AlertRow({ alert, onMarkRead }: { alert: Alert; onMarkRead: (id: number) => void }) {
  const t = useTranslations("alerts");
  const tAlertMessage = useTranslations("alerts.message");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const Icon = TYPE_ICON[alert.type];
  const unread = !alert.is_read;
  // A milestone has no ongoing condition to resolve — is_resolved reads
  // false for it same as an open problem, so the tag is type-gated, not
  // field-gated (see lib/alerts/types.ts).
  const showsResolution = alert.type !== "milestone";

  // A request alert opens that request; without its id (an API that does
  // not send `quick_request_id` yet) it opens the requests list.
  const action =
    alert.type === "quick_request"
      ? { label: t("openRequest"), href: alert.quick_request_id ? `/dashboard/requests?request=${alert.quick_request_id}` : "/dashboard/requests" }
      : { label: t("openPatient"), href: `/dashboard/patients/${alert.subscriber_id}` };

  return (
    <li className={`flex flex-wrap items-center gap-4 px-5 py-3.5 ${unread ? "bg-primary/[0.03]" : ""}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE_SQUARE[TYPE_TONE[alert.type]]}`}>
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
          <Link href={`/dashboard/patients/${alert.subscriber_id}`} className={`text-sm text-ink hover:text-primary hover:underline ${unread ? "font-extrabold" : "font-bold"}`}>
            {alert.subscriber_name}
          </Link>
          <span className="text-xs text-ink-muted">{alert.subscriber_code}</span>
          {unread && <span className="text-xs font-bold text-primary">{t("new")}</span>}
        </div>
        <p className={`text-sm ${unread ? "text-ink" : "text-ink-soft"}`}>{localizedAlertMessage(alert, tAlertMessage)}</p>
      </div>

      {/* Fixed widths so the columns line up down the list. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex w-16 justify-center">
          {showsResolution && <Badge tone={alert.is_resolved ? "neutral" : "warning"}>{alert.is_resolved ? t("resolvedTag") : t("open")}</Badge>}
        </span>
        <time dateTime={alert.created_at} className="w-[116px] text-[13px] tabular-nums text-ink-muted">
          {formatListDateTime(alert.created_at, locale, { today: tCommon("today"), yesterday: tCommon("yesterday") })}
        </time>
        <Link
          href={action.href}
          className={`inline-flex min-h-10 w-[132px] items-center justify-center rounded-[10px] px-2 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            unread ? "bg-primary/10" : ""
          }`}
        >
          {action.label}
        </Link>
        {unread ? (
          <button
            type="button"
            onClick={() => onMarkRead(alert.id)}
            aria-label={t("markRead")}
            title={t("markRead")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-border text-ink-muted transition-colors hover:border-primary/40 hover:bg-canvas hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Check size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center text-status-on-track-ink">
            <CheckCheck size={18} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">{t("read")}</span>
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * «بانتظار الاعتماد»: patients whose own goal / medication / allergy changes
 * wait for the nutritionist. Not an alert row (nothing to mark read): it
 * disappears once every proposal is approved or rejected on the patient page.
 * One amber band: the title on the start side, each patient a pill.
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
    <section id="proposals" className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-panel border border-status-attention/30 bg-status-attention-bg px-5 py-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
        <ClipboardCheck size={18} className="shrink-0 text-status-attention-ink" aria-hidden="true" />
        {t("title")}
      </h2>
      <ul className="flex flex-1 flex-wrap gap-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              href={`/dashboard/patients/${c.id}`}
              className="inline-flex min-h-11 flex-wrap items-center gap-x-2 rounded-xl bg-card px-3.5 py-1.5 text-sm transition-shadow hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="font-bold text-ink">{c.name}</span>
              <span className="text-xs text-ink-muted">{c.code}</span>
              <span className="font-semibold text-primary">{t("review", { count: c.pending_proposals_count ?? 0 })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
