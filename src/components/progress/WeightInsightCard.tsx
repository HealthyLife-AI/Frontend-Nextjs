"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RefreshCw, Scale } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatLongDate } from "@/lib/format/date";
import { getWeightInsight, regenerateWeightInsight, setWeightInsightVisibility, type WeightInsightResponse } from "@/lib/weightInsight/api";

/**
 * Phase 3, C6: "تفسير تغيّر الوزن": the explanation of the change between the
 * two latest weight readings, for the nutritionist to read and to decide
 * whether the patient sees it («إظهار للمريض», off by default).
 *
 * The text is a model's wording of facts the server computed; when the model
 * was unavailable or its reply was refused it is a fixed text instead, marked
 * «مولّد آليًا». The facts behind it are shown here, for the nutritionist only:
 * the patient's copy is the change and the text, nothing else.
 */
export function WeightInsightCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("weightInsight");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [data, setData] = useState<WeightInsightResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeightInsight(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) setData(r.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (failed || !data) return null;

  async function toggle(next: boolean) {
    setBusy(true);
    setError(null);
    const r = await setWeightInsightVisibility(authorizedFetch, subscriberId, next);
    setBusy(false);

    if (!r.ok) return setError(t("saveFailed"));
    setData((d) => (d ? { ...d, visible_to_patient: r.data.visible_to_patient } : d));
  }

  async function regenerate() {
    setBusy(true);
    setError(null);
    const r = await regenerateWeightInsight(authorizedFetch, subscriberId);
    setBusy(false);

    if (!r.ok) return setError(r.status === 429 ? t("throttled") : t("regenerateFailed"));
    setData(r.data);
  }

  const insight = data.insight;
  const number = (n: number, digits = 1) => new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { maximumFractionDigits: digits }).format(n);
  const yesNo = (v: boolean) => t(v ? "yes" : "no");
  // "rejected_blocklist:<word>" carries the word; anything unrecorded (an older text) says so.
  const fallbackReason = (reason: string | null) => {
    if (reason === null) return t("fallbackReason.unknown");
    const [key, word] = reason.split(":");
    return ["not_configured", "provider_failed", "empty", "rejected_digit", "rejected_length", "rejected_blocklist"].includes(key)
      ? t(`fallbackReason.${key}`, { word: word ?? "" })
      : t("fallbackReason.unknown");
  };
  const code = (group: "appetite" | "sleep" | "barrier", value: string | null) => (value === null ? "—" : t(`checkin.${group}.${value}`));

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Scale size={18} className="mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-ink">{t("title")}</h2>
            <p className="text-sm text-ink-muted">{t("subtitle")}</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={data.visible_to_patient}
            disabled={readOnly || busy}
            onChange={(e) => toggle(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("showToPatient")}
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}

      {!insight && <p className="text-sm text-ink-muted">{t("unavailable")}</p>}

      {insight && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold tabular-nums text-ink" dir="ltr">
              {insight.change_kg > 0 ? "+" : ""}
              {number(insight.change_kg)} {t("kg")}
            </span>
            <span className="text-xs text-ink-muted">
              {formatLongDate(insight.from_date, locale)} → {formatLongDate(insight.to_date, locale)}
            </span>
            {insight.is_fallback && <Badge tone="neutral">{t("auto")}</Badge>}
          </div>
          {insight.is_fallback && <p className="text-xs text-ink-muted">{fallbackReason(insight.fallback_reason)}</p>}

          <p className="rounded-field bg-canvas/60 p-3.5 text-sm leading-relaxed text-ink">{insight.text_ar}</p>

          <dl className="grid gap-x-6 gap-y-1 rounded-field bg-canvas/60 p-3 text-sm sm:grid-cols-2" aria-label={t("factsTitle")}>
            <dt className="col-span-full text-xs font-bold text-ink-muted">{t("factsTitle")}</dt>
            {(
              [
                ["days", t("daysValue", { count: insight.facts.days })],
                ["adherence", insight.facts.adherence_percent === null ? "—" : `${number(insight.facts.adherence_percent, 0)}%`],
                ["loggedDays", number(insight.facts.logged_days, 0)],
                ["offPlan", number(insight.facts.off_plan_meals, 0)],
                ["highSodium", number(insight.facts.high_sodium_logs, 0)],
                ["water", yesNo(insight.facts.likely_water_fluctuation)],
                ["consistent", yesNo(insight.facts.consistent_with_plan)],
              ] as const
            ).map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between gap-2">
                <dt className="text-ink-muted">{t(`fact.${key}`)}</dt>
                <dd className="font-semibold tabular-nums text-ink">{value}</dd>
              </div>
            ))}

            <div className="col-span-full mt-1 flex flex-col gap-1 border-t border-divider pt-2">
              {insight.facts.checkins === null ? (
                <span className="text-ink-muted">{t("noCheckins")}</span>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">{t("checkin.appetite.label")}</dt>
                    <dd className="font-semibold text-ink">{code("appetite", insight.facts.checkins.appetite)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">{t("checkin.sleep.label")}</dt>
                    <dd className="font-semibold text-ink">{code("sleep", insight.facts.checkins.sleep)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">{t("checkin.barrier.label")}</dt>
                    <dd className="font-semibold text-ink">
                      {insight.facts.checkins.barriers.length === 0 ? "—" : insight.facts.checkins.barriers.map((b) => code("barrier", b)).join("، ")}
                    </dd>
                  </div>
                </>
              )}
            </div>
          </dl>

          {!readOnly && (
            <div className="flex justify-end">
              <Button type="button" variant="secondary" isLoading={busy} onClick={regenerate}>
                <RefreshCw size={16} aria-hidden="true" />
                {t("regenerate")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
