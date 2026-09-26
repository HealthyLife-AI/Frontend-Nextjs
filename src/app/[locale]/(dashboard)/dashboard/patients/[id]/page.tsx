"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { getClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { getProgress } from "@/lib/progress/api";
import type { ProgressResponse } from "@/lib/progress/types";
import { AdherenceHeadline } from "@/components/progress/AdherenceHeadline";
import { BodyCompositionCards } from "@/components/progress/BodyCompositionCards";
import { PlanVsActualChart } from "@/components/progress/PlanVsActualChart";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { AiSummaryCard } from "@/components/aiSummaries/AiSummaryCard";
import { listAiSummaries } from "@/lib/aiSummaries/api";
import type { AiSummary } from "@/lib/aiSummaries/types";

/**
 * S4-07 / US-08 / UC-08: the Client Profile & Progress screen — the
 * summary header, then the AI weekly summary (S5-09), then weight trend,
 * plan-vs-actual and body composition, in the order the approved Stitch
 * reference (design-reference/.../nutricare_1) lays them out.
 *
 * Progress comes from ONE call (S4-04): `/clients/{id}/progress` carries
 * the weight series, the composition snapshots, the adherence block and
 * the daily-calorie series together, because this screen renders all
 * four and three round trips to paint one view is what NFR-01 is trying
 * to avoid.
 *
 * The mockup also shows an alerts panel and a recent-meals list. Alerts
 * are S5-08, wired to the roster-wide `/dashboard/alerts` page instead of
 * being duplicated here — the sidebar/header nav already point there, and
 * a per-client alert list is one `subscriber_id` filter away rather than
 * a second implementation. Its target-weight, body-fat-goal, macro-
 * adherence and water figures have no backing field anywhere in the API,
 * so they are not invented here (the rule S3-09 set for the plan designer).
 */
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("clients.detail");
  const tProgress = useTranslations("progress");
  const tGoals = useTranslations("goals");
  const { authorizedFetch } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [progressFailed, setProgressFailed] = useState(false);
  const [latestSummary, setLatestSummary] = useState<AiSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    getClient(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setClient(result.data);
      } else {
        setNotFound(true);
      }
    });

    // Fetched alongside the client rather than after it: the two are
    // independent requests and chaining them would serialise two round
    // trips for no reason. A progress failure leaves the header usable.
    getProgress(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setProgress(result.data);
      } else {
        setProgressFailed(true);
      }
    });

    // Same reasoning: independent of both calls above. No summary yet is
    // a real, expected state (a brand-new client, or before Monday's
    // first run) — AiSummaryCard renders its own empty state for it, so
    // a failed/empty fetch here just leaves latestSummary null.
    listAiSummaries(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data.data.length > 0) {
        setLatestSummary(result.data.data[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, id]);

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">404</p>
        <Link href="/dashboard/patients" className="inline-flex items-center rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-xs font-bold text-mkt-teal-deep transition-colors hover:border-primary hover:bg-mkt-mint-bg">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (!client) {
    return <div className="py-16 text-center text-sm text-ink-muted">…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/dashboard/patients"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-ink-muted shadow-panel transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {t("backToList")}
      </Link>

      {/*
        Patient header in the landing page's hero language: a deep-teal
        banner carrying identity + the two next actions, over a white
        facts strip. Same data and links as before, regrouped.
      */}
      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <div className="relative overflow-hidden bg-gradient-to-br from-mkt-teal-deep via-mkt-teal-cta to-mkt-dark-bg p-6 text-white sm:p-7">
          <div className="pointer-events-none absolute -top-24 end-[-3rem] h-64 w-64 rounded-full bg-mkt-mint/25 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold ring-4 ring-white/15 backdrop-blur">
                {client.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold leading-tight">{client.name}</h1>
                <span className="w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold tracking-wide" dir="ltr">
                  {client.code}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`/dashboard/patients/${client.id}/plan`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-white px-5 text-sm font-bold text-mkt-teal-deep shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <UtensilsCrossed size={18} strokeWidth={2} />
                {t("planLink")}
              </Link>
              <Link
                href={`/dashboard/patients/${client.id}/health-profile`}
                className="inline-flex h-11 items-center gap-2 rounded-field border border-white/30 bg-white/10 px-5 text-sm font-bold backdrop-blur transition-colors hover:bg-white/20"
              >
                <FileText size={18} strokeWidth={2} />
                {t("healthProfileLink")}
              </Link>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-divider text-sm sm:grid-cols-4 sm:divide-x sm:rtl:divide-x-reverse">
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("phoneLabel")}</dt>
            <dd className="font-bold text-ink" dir="ltr">
              {client.phone ?? "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("goalLabel")}</dt>
            <dd className="font-bold text-ink">{tGoals(client.goal)}</dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("statusLabel")}</dt>
            <dd>
              <ClientStatusBadge status={client.status} />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("adherenceLabel")}</dt>
            <dd>
              <AdherenceBadge status={client.adherence_status} />
            </dd>
          </div>
        </dl>
      </section>

      <AiSummaryCard summary={latestSummary} />

      {progressFailed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {tProgress("loadFailed")}
        </p>
      )}

      {progress && (
        <div className="flex flex-col gap-4">
          <AdherenceHeadline adherence={progress.adherence} />
          <WeightTrendChart points={progress.weight_trend} />
          <PlanVsActualChart days={progress.daily_calories} />
          <BodyCompositionCards
            latest={progress.body_composition.latest}
            previous={progress.body_composition.previous}
            change={progress.body_composition.change}
          />
        </div>
      )}
    </div>
  );
}
