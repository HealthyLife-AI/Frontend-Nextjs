"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Apple, Check, CheckCircle2, Clock, Stethoscope, UserCheck, Users, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StatTile } from "@/components/clients/StatTile";
import { PageHeader } from "@/components/ui/PageHeader";
import { FoodTable } from "@/components/foods/FoodTable";
import { usePendingFoods } from "@/components/admin/PendingFoodsProvider";
import { DailyRunStatus } from "@/components/admin/DailyRunStatus";
import { ConsentConfigStatus } from "@/components/admin/ConsentConfigStatus";
import { approveFood, getAdminOverview, listAdminFoods, rejectFood, type AdminOverview } from "@/lib/admin/api";
import type { CatalogFood } from "@/lib/foods/api";

/**
 * Admin home: platform-wide counts, the catalog's composition by source,
 * and the review queue for nutritionist-submitted foods (approve makes a
 * food usable in every nutritionist's plans; reject keeps it out).
 */
export default function AdminOverviewPage() {
  const t = useTranslations("admin");
  const tFoods = useTranslations("foods");
  const { authorizedFetch } = useAuth();
  const { refresh: refreshPendingBadge } = usePendingFoods();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [pending, setPending] = useState<CatalogFood[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    getAdminOverview(authorizedFetch).then((r) => (r.ok ? setOverview(r.data) : setFailed(true)));
    listAdminFoods(authorizedFetch, { status: "pending" }).then((r) => (r.ok ? setPending(r.data.data) : setFailed(true)));
  }, [authorizedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(food: CatalogFood, action: "approve" | "reject") {
    setBusyId(food.id);
    const result = await (action === "approve" ? approveFood : rejectFood)(authorizedFetch, food.id);
    setBusyId(null);
    if (result.ok) {
      load();
      refreshPendingBadge();
    }
  }

  const sources = overview ? overview.foods_by_source : null;
  const sourceTotal = sources ? sources.usda + sources.admin + sources.nutritionist || 1 : 1;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow={t("eyebrow")} title={t("overviewTitle")} subtitle={t("overviewSubtitle")} />

      {overview && <DailyRunStatus run={overview.last_daily_run} />}
      {overview && <ConsentConfigStatus configured={overview.consent_configured} />}

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-4 py-3 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile icon={Stethoscope} value={overview.nutritionists} label={t("statNutritionists")} tone="primary" />
          <StatTile icon={Users} value={overview.clients} label={t("statClients")} tone="primary" />
          <StatTile icon={UserCheck} value={overview.active_clients} label={t("statActiveClients")} tone="success" />
          <StatTile icon={Apple} value={overview.foods_total} label={t("statFoods")} tone="success" />
          <StatTile icon={Clock} value={overview.foods_pending} label={t("statPending")} tone="warning" />
        </div>
      )}

      {sources && (
        <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
          <h2 className="mb-4 text-base font-bold text-ink">{t("catalogBreakdown")}</h2>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-canvas">
            <div className="bg-gradient-to-r from-primary to-mkt-teal-deep" style={{ width: `${(sources.usda / sourceTotal) * 100}%` }} />
            <div className="bg-mkt-mint" style={{ width: `${(sources.admin / sourceTotal) * 100}%` }} />
            <div className="bg-status-attention" style={{ width: `${(sources.nutritionist / sourceTotal) * 100}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {(
              [
                ["usda", "bg-primary"],
                ["admin", "bg-mkt-mint"],
                ["nutritionist", "bg-status-attention"],
              ] as const
            ).map(([key, dot]) => (
              <span key={key} className="flex items-center gap-2 text-ink-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                {tFoods(`source.${key}`)}
                <strong className="tabular-nums text-ink">{sources[key].toLocaleString("en-US")}</strong>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <h2 className="flex items-center gap-2.5 border-b border-divider px-5 py-4 text-base font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-status-attention-bg text-status-attention">
            <Clock size={18} strokeWidth={1.9} />
          </span>
          {t("pendingTitle")}
        </h2>

        {pending === null ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">…</p>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2 size={28} strokeWidth={1.75} className="text-status-on-track" />
            <p className="text-sm text-ink-muted">{t("pendingEmpty")}</p>
          </div>
        ) : (
          <FoodTable
            foods={pending}
            showSource={false}
            actions={(food) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={busyId === food.id}
                  onClick={() => review(food, "approve")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-status-on-track-bg px-3.5 py-1.5 text-xs font-bold text-status-on-track transition-colors hover:bg-status-on-track hover:text-white disabled:opacity-50"
                >
                  <Check size={14} strokeWidth={2.4} />
                  {t("approve")}
                </button>
                <button
                  type="button"
                  disabled={busyId === food.id}
                  onClick={() => review(food, "reject")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-status-late-bg px-3.5 py-1.5 text-xs font-bold text-status-late transition-colors hover:bg-status-late hover:text-white disabled:opacity-50"
                >
                  <X size={14} strokeWidth={2.4} />
                  {t("reject")}
                </button>
              </div>
            )}
          />
        )}
      </section>
    </div>
  );
}
