"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAiUsage, type AiUsageReport } from "@/lib/admin/api";

const FEATURES = ["ai_draft", "plan_summary", "weekly_summary", "weight_insight", "ping", "other"];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Admin only: real LLM calls, tokens and estimated cost for a month, and what it comes to per active patient. */
export default function AdminAiUsagePage() {
  const t = useTranslations("aiUsage");
  const tAdmin = useTranslations("admin");
  const format = useFormatter();
  const { authorizedFetch } = useAuth();

  const [month, setMonth] = useState(currentMonth);
  // The answer carries the month it is for, so a stale one reads as "loading" without a state reset in the effect.
  const [answer, setAnswer] = useState<{ month: string; report: AiUsageReport | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAiUsage(authorizedFetch, month).then((r) => {
      if (!cancelled) setAnswer({ month, report: r.ok ? r.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, month]);

  const current = answer?.month === month ? answer : null;
  const report = current?.report ?? null;
  const failed = current !== null && current.report === null;

  const money = (value: number | null) =>
    value === null ? "—" : format.number(value, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const count = (value: number) => format.number(value);
  const featureLabel = (key: string) => (FEATURES.includes(key) ? t(`features.${key}`) : key);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            {t("month")}
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="h-11 rounded-field border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
        }
      />

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {!report && !failed && <p className="px-5 py-14 text-center text-sm text-ink-muted">…</p>}

      {report && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-panel border-2 border-primary/40 bg-mkt-mint-bg/60 p-5 shadow-panel sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold text-mkt-teal-deep">{t("costPerPatient")}</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-ink" dir="ltr">
                {money(report.cost_per_active_patient_usd)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {report.active_patients > 0 ? t("costPerPatientHint", { patients: report.active_patients }) : t("noPatients")}
              </p>
            </div>
            <div className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
              <p className="text-xs font-bold text-ink-muted">{t("totalCost")}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink" dir="ltr">
                {money(report.totals.cost_usd)}
              </p>
            </div>
            <div className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
              <p className="text-xs font-bold text-ink-muted">{t("totalCalls")}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink">{count(report.totals.calls)}</p>
            </div>
            <div className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
              <p className="text-xs font-bold text-ink-muted">{t("totalTokens")}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink">{count(report.totals.total_tokens)}</p>
            </div>
          </section>

          {report.totals.calls === 0 ? (
            <p className="rounded-panel border border-border/70 bg-card px-5 py-14 text-center text-sm text-ink-muted shadow-panel">{t("empty")}</p>
          ) : (
            <>
              <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
                <h2 className="border-b border-divider px-5 py-4 text-base font-extrabold text-ink">{t("byFeature")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-border/70 bg-mkt-mint-bg/60 text-xs font-bold text-mkt-teal-deep">
                        <th className="px-5 py-3.5 text-start">{t("colFeature")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colCalls")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colTokensIn")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colTokensOut")}</th>
                        <th className="px-5 py-3.5 text-end">{t("colCost")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.by_feature.map((row) => (
                        <tr key={row.feature} className="border-b border-divider last:border-0 hover:bg-mkt-mint-bg/40">
                          <td className="px-5 py-3 font-bold text-ink">{featureLabel(row.feature)}</td>
                          <td className="px-3 py-3 text-end tabular-nums">{count(row.calls)}</td>
                          <td className="px-3 py-3 text-end tabular-nums">{count(row.prompt_tokens)}</td>
                          <td className="px-3 py-3 text-end tabular-nums">{count(row.completion_tokens)}</td>
                          <td className="px-5 py-3 text-end font-bold tabular-nums" dir="ltr">
                            {money(row.cost_usd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
                <h2 className="border-b border-divider px-5 py-4 text-base font-extrabold text-ink">{t("topNutritionists")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-border/70 bg-mkt-mint-bg/60 text-xs font-bold text-mkt-teal-deep">
                        <th className="px-5 py-3.5 text-start">{t("colNutritionist")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colCalls")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colCost")}</th>
                        <th className="px-3 py-3.5 text-end">{t("colPatients")}</th>
                        <th className="px-5 py-3.5 text-end">{t("colPerPatient")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.top_nutritionists.map((n) => (
                        <tr key={n.id} className="border-b border-divider last:border-0 hover:bg-mkt-mint-bg/40">
                          <td className="px-5 py-3 font-bold text-ink">{n.name ?? `#${n.id}`}</td>
                          <td className="px-3 py-3 text-end tabular-nums">{count(n.calls)}</td>
                          <td className="px-3 py-3 text-end tabular-nums" dir="ltr">
                            {money(n.cost_usd)}
                          </td>
                          <td className="px-3 py-3 text-end tabular-nums">{count(n.active_patients)}</td>
                          <td className="px-5 py-3 text-end font-bold tabular-nums" dir="ltr">
                            {money(n.cost_per_active_patient_usd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <section className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-muted">
            <p>
              <span className="font-bold">{t("definitionTitle")}: </span>
              {t("definitionBody")}
            </p>
            <p>
              {t("pricesNote", {
                input: report.prices_usd_per_million.input,
                cached: report.prices_usd_per_million.cached_input,
                output: report.prices_usd_per_million.output,
              })}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
