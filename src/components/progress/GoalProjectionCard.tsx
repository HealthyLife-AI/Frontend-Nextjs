"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { formatLongDate } from "@/lib/format/date";
import { getGoalProjection, setGoalProjectionVisibility, type GoalProjectionResponse } from "@/lib/goalProjection/api";

/**
 * Phase 2, C4: "توقع الوصول للهدف": when the patient could reach their target
 * weight under three adherence levels, with the one nearest their own marked,
 * and the trend the scale actually shows. An ESTIMATE, labelled as one.
 *
 * The inputs it was computed from (including calorie figures) are shown here,
 * for the nutritionist only. The «إظهار للمريض» switch decides whether the
 * patient's app shows it at all (off by default); the patient's copy never
 * carries a calorie number.
 */
export function GoalProjectionCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("goalProjection");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [data, setData] = useState<GoalProjectionResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGoalProjection(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) setData(r.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (failed) return null;
  if (!data) return null;

  async function toggle(next: boolean) {
    setBusy(true);
    setError(null);
    const r = await setGoalProjectionVisibility(authorizedFetch, subscriberId, next);
    setBusy(false);

    if (!r.ok) return setError(t("saveFailed"));
    setData((d) => (d ? { ...d, visible_to_patient: r.data.visible_to_patient } : d));
  }

  const p = data.projection;
  const number = (n: number, digits = 1) => new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { maximumFractionDigits: digits }).format(n);

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Target size={18} className="mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-ink">{t("title")}</h2>
            <p className="text-sm text-ink-muted">{t("estimateNote")}</p>
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

      {!p && <p className="text-sm text-ink-muted">{t("unavailable")}</p>}

      {p && (
        <>
          <p className="text-sm text-ink">{t(p.direction === "loss" ? "remainingLoss" : "remainingGain", { kg: number(p.remaining_kg) })}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            {p.scenarios.map((s) => {
              const current = p.current_level === s.level;

              return (
                <div key={s.level} className={`flex flex-col gap-1 rounded-field border p-3 ${current ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20" : "border-border/70 bg-canvas/40"}`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold text-ink">{t(`level.${s.level}`)}</span>
                    {current && <Badge tone="primary">{t("currentLevel")}</Badge>}
                  </div>
                  {s.reachable && s.weeks !== null ? (
                    <>
                      <span className="text-lg font-extrabold tabular-nums text-ink">{t("weeks", { count: s.weeks })}</span>
                      <span className="text-xs text-ink-muted">{formatLongDate(s.estimated_date, locale)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-ink-muted">{t("notReachable")}</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-ink">
            {p.current_level === null ? t("noAdherenceYet") : t("currentLevelLine", { level: t(`level.${p.current_level}`) })}
            {" · "}
            {p.observed_weekly_change_kg === null ? t("noTrend") : t("observedTrend", { value: number(p.observed_weekly_change_kg, 2) })}
          </p>

          <dl className="grid gap-x-6 gap-y-1 rounded-field bg-canvas/60 p-3 text-sm sm:grid-cols-2" aria-label={t("inputsTitle")}>
            <dt className="col-span-full text-xs font-bold text-ink-muted">{t("inputsTitle")}</dt>
            {(
              [
                ["currentWeight", `${number(p.inputs.current_weight_kg)} ${t("kg")}`],
                ["targetWeight", `${number(p.inputs.target_weight_kg)} ${t("kg")}`],
                ["maintenance", t("kcalPerDay", { value: p.inputs.maintenance_kcal })],
                ["target", t("kcalPerDay", { value: p.inputs.target_kcal })],
                ["adherence", p.inputs.adherence_percent === null ? "—" : `${number(p.inputs.adherence_percent, 0)}%`],
                ["weeklyFull", `${number(p.inputs.weekly_change_full_kg, 2)} ${t("kgPerWeek")}`],
              ] as const
            ).map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between gap-2">
                <dt className="text-ink-muted">{t(`input.${key}`)}</dt>
                <dd className="font-semibold tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-ink-muted">{p.disclaimer_ar}</p>
        </>
      )}
    </section>
  );
}
