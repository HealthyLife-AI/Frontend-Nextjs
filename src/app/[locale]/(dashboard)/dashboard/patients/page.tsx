"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Users, ShieldCheck, AlertTriangle, BellOff, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { StatTile } from "@/components/clients/StatTile";
import { getDashboardOverview, listClients } from "@/lib/clients/api";
import type { Client, DashboardOverview } from "@/lib/clients/types";

const STATUS_FILTERS = [
  { labelKey: "filterAll", status: undefined, adherence: undefined },
  { labelKey: "filterActive", status: "active", adherence: undefined },
  { labelKey: "filterPending", status: "pending", adherence: undefined },
  { labelKey: "filterOnTrack", status: undefined, adherence: "on_track" },
  { labelKey: "filterNeedsAttention", status: undefined, adherence: "needs_attention" },
  { labelKey: "filterLate", status: undefined, adherence: "late" },
] as const;

/**
 * F-2 / S2-10: Client List / Dashboard — the approved Stitch reference
 * (design-reference/.../nutricare_3) combines the stat-tile row and the
 * client table into one screen, reached from the "Patients" nav item
 * (not "Dashboard" — the mockup's active nav state there is المرضى).
 *
 * Data fetching is client-side (see AuthProvider's docblock for why: SSR
 * would need to rotate the refresh cookie from a Server Component render,
 * which Next.js doesn't allow). Filters/search/page still live in the URL
 * — dashboard-builder's "state is the URL, not client state" principle,
 * just navigated via client-side routing instead of a raw `<form
 * method="get">`, since a full page reload would fight the CSR fetch.
 */
export default function PatientsPage() {
  const t = useTranslations("clients.list");
  const tStats = useTranslations("clients.stats");
  const { authorizedFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? undefined;
  const adherence = searchParams.get("adherence") ?? undefined;
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Necessary setState-in-effect: this IS the data fetch (dashboard
    // overview + client list for the current filters), there's no
    // render-time computation that could replace it. `setLoading(true)`
    // has to run as soon as the effect fires — not after the await — so
    // the table shows its loading state immediately when filters change,
    // not only once the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    (async () => {
      const [overviewResult, clientsResult] = await Promise.all([
        getDashboardOverview(authorizedFetch),
        listClients(authorizedFetch, { status, adherence, search, page }),
      ]);

      if (cancelled) return;

      if (overviewResult.ok) setOverview(overviewResult.data);
      if (clientsResult.ok) {
        setClients(clientsResult.data.data);
        setMeta(clientsResult.data.meta);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, status, adherence, search, page]);

  function navigate(next: { status?: string; adherence?: string; search?: string; page?: number }) {
    const query: Record<string, string> = {};
    if (next.status) query.status = next.status;
    if (next.adherence) query.adherence = next.adherence;
    if (next.search) query.search = next.search;
    if (next.page && next.page > 1) query.page = String(next.page);

    router.push({ pathname: "/dashboard/patients", query });
  }

  function isFilterActive(filter: (typeof STATUS_FILTERS)[number]) {
    return filter.status === status && filter.adherence === adherence;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-muted">{t("subtitle")}</p>
        </div>

        <Link href="/dashboard/patients/new">
          <Button>
            <Plus size={18} strokeWidth={1.75} />
            {t("addButton")}
          </Button>
        </Link>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={Users} value={overview.total} label={tStats("total")} tone="primary" />
          <StatTile icon={ShieldCheck} value={overview.active} label={tStats("active")} tone="success" />
          <StatTile
            icon={AlertTriangle}
            value={overview.needs_attention}
            label={tStats("needsAttention")}
            tone="warning"
          />
          <StatTile
            icon={BellOff}
            value={overview.not_logged_today}
            label={tStats("notLoggedToday")}
            tone="danger"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.labelKey}
              type="button"
              onClick={() => navigate({ status: filter.status, adherence: filter.adherence })}
              className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
                isFilterActive(filter)
                  ? "bg-primary text-card"
                  : "text-ink-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("search");
            navigate({ status, adherence, search: typeof value === "string" ? value : "" });
          }}
          className="relative flex items-center"
        >
          <Search size={16} className="pointer-events-none absolute start-3 text-ink-muted" />
          <input
            key={search}
            type="search"
            name="search"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full min-w-[220px] rounded-control border border-border bg-canvas ps-9 pe-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <th className="px-4 py-3 text-start">{t("columnName")}</th>
                <th className="px-4 py-3 text-start">{t("columnGoal")}</th>
                <th className="px-4 py-3 text-start">{t("columnStatus")}</th>
                <th className="px-4 py-3 text-start">{t("columnAdherence")}</th>
                <th className="px-4 py-3 text-end">{t("columnActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    …
                  </td>
                </tr>
              )}

              {!loading && clients?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    {search || status || adherence ? t("noResults") : t("empty")}
                  </td>
                </tr>
              )}

              {!loading &&
                clients?.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-ink-muted">
              {t("showingRange", {
                from: (meta.current_page - 1) * (clients?.length ?? 0) + 1,
                to: (meta.current_page - 1) * (clients?.length ?? 0) + (clients?.length ?? 0),
                total: meta.total,
              })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => navigate({ status, adherence, search, page: meta.current_page - 1 })}
                className="rounded-control px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-40"
              >
                {t("previousPage")}
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => navigate({ status, adherence, search, page: meta.current_page + 1 })}
                className="rounded-control px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-40"
              >
                {t("nextPage")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const t = useTranslations("clients.list");
  const tGoals = useTranslations("goals");

  return (
    <tr className="border-b border-divider last:border-0 hover:bg-canvas">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {client.name.charAt(0)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-ink">{client.name}</span>
            <span className="text-xs text-ink-muted">{client.code}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-muted">{tGoals(client.goal)}</td>
      <td className="px-4 py-3">
        <ClientStatusBadge status={client.status} />
      </td>
      <td className="px-4 py-3">
        <AdherenceBadge status={client.adherence_status} />
      </td>
      <td className="px-4 py-3 text-end">
        <Link
          href={`/dashboard/patients/${client.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("viewAction")}
        </Link>
      </td>
    </tr>
  );
}
