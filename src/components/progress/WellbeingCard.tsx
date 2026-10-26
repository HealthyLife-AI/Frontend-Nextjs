"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Moon } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getWellbeing, type WellbeingResponse } from "@/lib/wellbeing/api";

const MAX_HOURS = 12;
const DOT = { good: "bg-status-on-track", ok: "bg-status-attention", low: "bg-status-late", medium: "bg-status-attention", high: "bg-status-late" } as const;
// Mood: good is green, low is red. Stress is the other way round: low is green, high is red.
const STRESS_DOT = { low: "bg-status-on-track", medium: "bg-status-attention", high: "bg-status-late" } as const;

/**
 * Phase 4, C3: "النوم والمزاج": the last 14 days of the patient's own sleep, mood
 * and stress. A bar per night (hours), a mood dot and a stress dot under it, and
 * the summary (average sleep, short nights, the most frequent stress / mood).
 * Not printed; no AI.
 */
export function WellbeingCard({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("wellbeing");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [data, setData] = useState<WellbeingResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWellbeing(authorizedFetch, subscriberId).then((r) => {
      if (!cancelled && r.ok) setData(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (!data) return null;

  const { summary, logs } = data;
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const days = Array.from({ length: summary.days }, (_, i) => {
    const d = new Date(`${summary.from}T12:00:00`);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return { key, day: d.getDate(), log: byDate.get(key) ?? null };
  });
  const number = (n: number) => new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { maximumFractionDigits: 1 }).format(n);

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <Moon size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
      </div>

      {summary.logged_days === 0 ? (
        <p className="text-sm text-ink-muted">{t("empty")}</p>
      ) : (
        <>
          <dl className="grid gap-2 text-sm sm:grid-cols-4">
            <div className="flex flex-col rounded-field bg-canvas/60 p-3">
              <dt className="text-xs text-ink-muted">{t("avgSleep")}</dt>
              <dd className="font-bold tabular-nums text-ink">{summary.avg_sleep_hours === null ? "—" : t("hours", { value: number(summary.avg_sleep_hours) })}</dd>
            </div>
            <div className="flex flex-col rounded-field bg-canvas/60 p-3">
              <dt className="text-xs text-ink-muted">{t("shortNights")}</dt>
              <dd className="font-bold tabular-nums text-ink">{summary.nights_under_6h}</dd>
            </div>
            <div className="flex flex-col rounded-field bg-canvas/60 p-3">
              <dt className="text-xs text-ink-muted">{t("topStress")}</dt>
              <dd className="font-bold text-ink">{summary.top_stress ? t(`stress.${summary.top_stress}`) : "—"}</dd>
            </div>
            <div className="flex flex-col rounded-field bg-canvas/60 p-3">
              <dt className="text-xs text-ink-muted">{t("topMood")}</dt>
              <dd className="font-bold text-ink">{summary.top_mood ? t(`mood.${summary.top_mood}`) : "—"}</dd>
            </div>
          </dl>

          <div className="flex items-end gap-1" role="img" aria-label={t("chartLabel")} dir="ltr">
            {days.map(({ key, day, log }) => {
              const hours = log?.sleep_hours ?? null;
              const short = hours !== null && hours < 6;

              return (
                <div key={key} className="flex flex-1 flex-col items-center gap-1" title={`${key}${hours !== null ? ` · ${number(hours)}` : ""}`}>
                  <div className="flex h-24 w-full items-end">
                    {hours !== null && (
                      <div className={`w-full rounded-t ${short ? "bg-status-attention" : "bg-primary/70"}`} style={{ height: `${Math.min(100, (hours / MAX_HOURS) * 100)}%` }} />
                    )}
                  </div>
                  <span className={`h-2 w-2 rounded-full ${log?.mood ? DOT[log.mood] : "bg-border"}`} aria-hidden="true" />
                  <span className={`h-2 w-2 rounded-full ${log?.stress ? STRESS_DOT[log.stress] : "bg-border"}`} aria-hidden="true" />
                  <span className="text-[10px] tabular-nums text-ink-muted">{day}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-ink-muted">{t("legend")}</p>
        </>
      )}
    </section>
  );
}
