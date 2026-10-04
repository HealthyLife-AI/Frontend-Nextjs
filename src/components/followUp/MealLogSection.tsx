"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { getDailyMealLogs, type DailyLog, type DailyMealLogs, type LogKind } from "@/lib/followUp/api";
import type { MealName } from "@/lib/mealPlans/types";

const DAYS = 7;
const MEAL_ORDER: (MealName | "other")[] = ["breakfast", "snack", "lunch", "dinner", "other"];
const KIND_TONE: Record<LogKind, "primary" | "success" | "neutral"> = { planned: "primary", alternative: "success", off_plan: "neutral" };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shift(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/**
 * The patient's meal log, a week at a time, newest day first. Each log says
 * in words whether it was from the plan, an alternative or off-plan (as it
 * was when logged — a later plan edit doesn't change it), and whether it was
 * entered late or edited.
 */
export function MealLogSection({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("followUp.mealLog");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [to, setTo] = useState(() => isoDate(new Date()));
  const [data, setData] = useState<DailyMealLogs | null>(null);
  const [failed, setFailed] = useState(false);
  const today = isoDate(new Date());

  useEffect(() => {
    let cancelled = false;
    getDailyMealLogs(authorizedFetch, subscriberId, shift(to, -(DAYS - 1)), to)
      .then((result) => {
        if (cancelled) return;
        setFailed(!result.ok);
        if (result.ok) setData(result.data);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId, to]);

  const dayFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
  const timeFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  const foodName = (log: DailyLog) => (locale === "ar" ? log.food?.name_ar ?? log.food?.name_en : log.food?.name_en ?? log.food?.name_ar) ?? "—";

  return (
    <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ClipboardList size={20} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-ink">{t("title")}</h2>
            <p className="text-xs text-ink-muted">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTo(shift(to, -DAYS))}
            className="inline-flex h-9 items-center gap-1 rounded-control border border-border px-3 text-xs font-semibold text-ink-muted hover:text-mkt-teal-deep"
          >
            <ChevronRight size={14} className="rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
            {t("previous")}
          </button>
          <button
            type="button"
            onClick={() => setTo(shift(to, DAYS) > today ? today : shift(to, DAYS))}
            disabled={to >= today}
            className="inline-flex h-9 items-center gap-1 rounded-control border border-border px-3 text-xs font-semibold text-ink-muted hover:text-mkt-teal-deep disabled:opacity-40"
          >
            {t("next")}
            <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </div>

      {failed && (
        <p role="alert" className="mt-4 rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {!data && !failed && <div className="mt-4 h-40 animate-pulse rounded-field bg-ink-muted/10" role="status" aria-label={t("loading")} />}

      {data && (
        <ol className="mt-4 flex flex-col gap-3">
          {data.days.map((day) => {
            const groups = MEAL_ORDER.map((meal) => ({
              meal,
              logs: day.logs.filter((l) => (l.meal_type ?? "other") === meal),
            })).filter((g) => g.logs.length > 0);

            return (
              <li key={day.date} className="rounded-field border border-border/70 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink">{dayFormat.format(new Date(`${day.date}T12:00:00Z`))}</h3>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {day.planned_calories !== null
                      ? t("calories", { logged: Math.round(day.logged_calories), planned: Math.round(day.planned_calories) })
                      : t("caloriesNoPlan", { logged: Math.round(day.logged_calories) })}
                  </p>
                </div>

                {groups.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">{t("empty")}</p>
                ) : (
                  <div className="mt-3 flex flex-col gap-3">
                    {groups.map((group) => (
                      <div key={group.meal}>
                        <p className="mb-1.5 text-xs font-semibold text-ink-muted">{group.meal === "other" ? t("otherMeal") : tSlots(group.meal)}</p>
                        <ul className="flex flex-col gap-1.5">
                          {group.logs.map((log) => (
                            <li key={log.id} className="flex flex-col gap-1.5 rounded-control bg-canvas px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink">{foodName(log)}</p>
                                <p className="text-xs text-ink-muted tabular-nums">
                                  {t("logLine", { grams: Math.round(log.quantity_grams), kcal: Math.round(log.macros.calories), time: timeFormat.format(new Date(log.logged_at)) })}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge tone={KIND_TONE[log.log_kind]}>{t(`kind.${log.log_kind}`)}</Badge>
                                {log.is_late && <Badge tone="warning">{t("late")}</Badge>}
                                {log.edited_at && <Badge tone="neutral">{t("edited")}</Badge>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
