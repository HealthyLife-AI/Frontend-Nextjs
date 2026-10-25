"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sunrise } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getTodaySummary, type TodaySummary } from "@/lib/today/api";

/**
 * Phase 3, B4: "رسالة الصباح", a read-only preview of exactly what this patient
 * sees today in the app: their meals by part of the day, today's activities,
 * the reminders that apply, and one motivation line. Built from the patient's
 * own data by the server; nothing here is editable and there is no calorie figure.
 */
export function MorningPreviewCard({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("morningPreview");
  const { authorizedFetch } = useAuth();

  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTodaySummary(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) setSummary(r.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (failed || !summary) return null;

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <Sunrise size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-bold text-ink">{t("meals")}</h3>
          {summary.meals.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("noMeals")}</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm text-ink">
              {summary.meals.map((meal, i) => (
                <li key={`${meal.name}-${i}`} className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{meal.name_ar}</span>
                  <span className="text-ink-muted">{meal.window}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-bold text-ink">{t("activities")}</h3>
          {summary.activities.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("noActivities")}</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm text-ink">
              {summary.activities.map((a, i) => (
                <li key={`${a.title}-${i}`}>
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-ink-muted"> · {t("activityLine", { minutes: a.duration_minutes, times: a.times_per_day })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-ink">{t("reminders")}</h3>
        {summary.reminders.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("noReminders")}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {summary.reminders.map((r) => (
              <li key={r.type}>{r.text_ar}</li>
            ))}
          </ul>
        )}
      </div>

      {summary.motivation_ar && <p className="rounded-field bg-mkt-mint-bg/60 px-3.5 py-2.5 text-sm font-semibold text-mkt-emerald-deep">{summary.motivation_ar}</p>}
    </section>
  );
}
