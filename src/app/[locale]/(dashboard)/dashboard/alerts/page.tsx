"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Bell, CalendarX, Flame, Award, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { listAlerts, markAlertRead } from "@/lib/alerts/api";
import type { Alert, AlertType } from "@/lib/alerts/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { localizedAlertMessage } from "@/lib/alerts/message";

const FILTERS = [
  { labelKey: "filterAll", is_read: undefined },
  { labelKey: "filterUnread", is_read: false },
  { labelKey: "filterRead", is_read: true },
] as const;

const TYPE_ICON: Record<AlertType, typeof CalendarX> = {
  no_log: CalendarX,
  calories_exceeded: Flame,
  milestone: Award,
};

/** Same tint used for the icon chip and the leading dot elsewhere on this screen. */
const TYPE_TONE: Record<AlertType, "danger" | "warning" | "success"> = {
  no_log: "danger",
  calories_exceeded: "warning",
  milestone: "success",
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

  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    listAlerts(authorizedFetch, { is_read: isRead, page }).then((result) => {
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
  }, [authorizedFetch, isRead, page]);

  function navigate(next: { is_read?: boolean; page?: number }) {
    const query: Record<string, string> = {};
    if (next.is_read !== undefined) query.is_read = String(next.is_read);
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

      <div className="flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.labelKey}
            type="button"
            onClick={() => navigate({ is_read: filter.is_read })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              filter.is_read === isRead
                ? "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand"
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
              {isRead === undefined ? t("emptyHint") : t("noResults")}
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
              onClick={() => navigate({ is_read: isRead, page: meta.current_page - 1 })}
              className="rounded-field px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {t("previousPage")}
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => navigate({ is_read: isRead, page: meta.current_page + 1 })}
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
      }`}
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
