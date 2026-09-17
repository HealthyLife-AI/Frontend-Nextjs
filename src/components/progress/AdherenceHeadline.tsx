"use client";

import { useTranslations } from "next-intl";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import type { AdherenceSummary } from "@/lib/progress/types";

/**
 * FR-18 / FR-30 / BR-14 — the headline is the DIRECTION, and the
 * percentage is context beside it.
 *
 * That ordering is the whole point of the S4-03 rework: both interviewed
 * nutritionists said a percentage on its own is not what prompts
 * intervention, so this component must never present the rate as a grade.
 * `reference_percent` is labelled as a reference and deliberately not
 * styled as a pass/fail threshold — no red-below/green-above.
 *
 * `adherence_percent: null` renders as "not enough data", never as 0% —
 * the backend distinguishes the two on purpose (FR-18) and collapsing
 * them would tell a nutritionist a client ate nothing on plan when the
 * truth is they logged nothing at all.
 */
export function AdherenceHeadline({ adherence }: { adherence: AdherenceSummary }) {
  const t = useTranslations("progress.adherence");
  const hasRate = adherence.adherence_percent !== null;
  const changePp = adherence.change_pp;

  const ChangeIcon = changePp === null || changePp === 0 ? Minus : changePp > 0 ? TrendingUp : TrendingDown;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
          <p className="text-xs text-ink-muted">
            {t("window", { from: adherence.from, to: adherence.to })}
          </p>
        </div>
        <AdherenceBadge status={adherence.status} />
      </header>

      <div className="flex flex-wrap items-end gap-6">
        {/*
          No rate means no figure at all — an em-dash sized like a hero
          number reads as a broken element where a number failed to load,
          which is the opposite of what this state is saying.
        */}
        <div>
          {hasRate && (
            <span className="text-3xl font-semibold tabular-nums text-ink">
              {adherence.adherence_percent}%
            </span>
          )}
          <p className="text-xs text-ink-muted">{hasRate ? t("rateLabel") : t("noData")}</p>
        </div>

        {hasRate && (
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <ChangeIcon size={16} strokeWidth={2} />
            <span className="tabular-nums">
              {changePp === null
                ? t("noPrevious")
                : t("changeVsPrevious", { pp: `${changePp > 0 ? "+" : ""}${changePp}` })}
            </span>
          </div>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-divider pt-4 text-sm sm:grid-cols-4">
        <Stat label={t("totalLogs")} value={adherence.total_logs} />
        <Stat label={t("onPlanLogs")} value={adherence.on_plan_logs} />
        <Stat label={t("offPlanLogs")} value={adherence.off_plan_logs} />
        <Stat label={t("reference")} value={`${adherence.reference_percent}%`} muted />
      </dl>
    </section>
  );
}

function Stat({ label, value, muted }: { label: string; value: number | string; muted?: boolean }) {
  return (
    <div className="rounded-control bg-canvas p-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 font-semibold tabular-nums ${muted ? "text-ink-muted" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
