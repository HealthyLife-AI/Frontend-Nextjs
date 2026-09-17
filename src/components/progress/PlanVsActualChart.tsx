"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DailyCalories } from "@/lib/progress/types";
import { EmptyPlot } from "./WeightTrendChart";

const VIEW_W = 640;
const VIEW_H = 240;
const PAD = { top: 20, right: 12, bottom: 34, left: 44 };
/** Mark spec: a 2px surface gap between the two bars of a day. */
const BAR_GAP = 2;

/**
 * S4-07 / FR-19: planned versus actually-eaten calories, per day.
 *
 * Encoding, in the order it was decided:
 *
 * - `planned` is a REFERENCE, not a rival series, so it is drawn as a
 *   recessive tinted bar rather than a second saturated hue. Telling it
 *   from the actual bar rests on lightness + position + the legend, none
 *   of which is hue-dependent.
 * - `logged` is solid primary normally, and switches to the amber status
 *   token on a day that went OVER the plan — a state, not an identity,
 *   which is why a status color is allowed here and why it ships with a
 *   marker and a legend entry rather than color alone.
 * - That teal/amber pair was validated, not eyeballed: ΔE 22.6 normal
 *   vision, 15.6 protan, 23.3 tritan against a white surface. The two
 *   mint steps in the design system both failed the normal-vision floor
 *   against the primary (ΔE 8.5), so they are deliberately not used.
 *
 * `dir="ltr"` for the same reason as the weight chart: days run
 * left-to-right in a chart even on an Arabic page.
 */
export function PlanVsActualChart({ days }: { days: DailyCalories[] }) {
  const t = useTranslations("progress.planVsActual");
  const [hovered, setHovered] = useState<number | null>(null);

  const hasAnything = days.some((d) => d.planned_calories !== null || d.logged_calories > 0);

  if (days.length === 0 || !hasAnything) {
    return <EmptyPlot title={t("title")} message={t("emptyNoData")} hint={t("emptyNoDataHint")} />;
  }

  const daysWithLogs = days.filter((d) => d.logged_calories > 0).length;
  const noPlan = days.every((d) => d.planned_calories === null);

  const peak = Math.max(...days.flatMap((d) => [d.planned_calories ?? 0, d.logged_calories]), 1);
  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;
  const slot = plotW / days.length;
  const barW = Math.min(22, (slot - BAR_GAP * 3) / 2);

  const baseline = PAD.top + plotH;
  const heightFor = (value: number) => (value / peak) * plotH;

  const gridValues = [peak, peak / 2];

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        <p className="text-xs text-ink-muted">{t("subtitle", { days: days.length })}</p>
      </header>

      {noPlan && (
        <p className="mb-3 rounded-control bg-canvas px-3 py-2 text-xs text-ink-muted">{t("noActivePlan")}</p>
      )}
      {!noPlan && daysWithLogs > 0 && daysWithLogs < days.length && (
        <p className="mb-3 rounded-control bg-canvas px-3 py-2 text-xs text-ink-muted">
          {t("partial", { logged: daysWithLogs, total: days.length })}
        </p>
      )}

      {/* Scrolls instead of shrinking — see WeightTrendChart's note. */}
      <div className="relative overflow-x-auto" dir="ltr">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full min-w-[520px]"
          role="img"
          aria-label={t("ariaLabel", { days: days.length })}
        >
          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={VIEW_W - PAD.right}
                y1={baseline - heightFor(value)}
                y2={baseline - heightFor(value)}
                stroke="var(--color-divider)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={baseline - heightFor(value) + 4}
                textAnchor="end"
                className="fill-[var(--color-ink-muted)] text-[10px] tabular-nums"
              >
                {Math.round(value)}
              </text>
            </g>
          ))}
          <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={baseline} y2={baseline} stroke="var(--color-border)" strokeWidth={1} />

          {days.map((day, i) => {
            const groupX = PAD.left + slot * i + (slot - (barW * 2 + BAR_GAP)) / 2;
            const over = day.planned_calories !== null && day.logged_calories > day.planned_calories;
            const loggedH = heightFor(day.logged_calories);
            const plannedH = day.planned_calories === null ? 0 : heightFor(day.planned_calories);

            return (
              <g
                key={day.date}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH} fill="transparent" />

                {day.planned_calories !== null && (
                  <rect
                    x={groupX}
                    y={baseline - plannedH}
                    width={barW}
                    height={plannedH}
                    rx={4}
                    fill="var(--color-primary)"
                    opacity={0.22}
                  />
                )}

                {day.logged_calories > 0 && (
                  <rect
                    x={groupX + barW + BAR_GAP}
                    y={baseline - loggedH}
                    width={barW}
                    height={loggedH}
                    rx={4}
                    fill={over ? "var(--color-status-attention)" : "var(--color-primary)"}
                  />
                )}

                {over && (
                  <text
                    x={groupX + barW + BAR_GAP + barW / 2}
                    y={baseline - loggedH - 6}
                    textAnchor="middle"
                    className="fill-[var(--color-status-attention)] text-[11px] font-bold"
                    aria-hidden="true"
                  >
                    !
                  </text>
                )}

                <text
                  x={PAD.left + slot * i + slot / 2}
                  y={VIEW_H - 12}
                  textAnchor="middle"
                  className="fill-[var(--color-ink-muted)] text-[10px] tabular-nums"
                >
                  {day.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-control bg-ink px-2.5 py-1.5 text-xs text-card shadow-float"
            style={{ left: `${((PAD.left + slot * hovered + slot / 2) / VIEW_W) * 100}%` }}
          >
            <span className="block text-[10px] opacity-80 tabular-nums">{days[hovered].date}</span>
            <span className="block tabular-nums">
              {t("plannedShort")}:{" "}
              {days[hovered].planned_calories === null ? "—" : Math.round(days[hovered].planned_calories)}
            </span>
            <span className="block tabular-nums">
              {t("loggedShort")}: {Math.round(days[hovered].logged_calories)}
            </span>
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-4 border-t border-divider pt-3 text-xs text-ink-muted">
        <LegendItem className="bg-primary/25" label={t("planned")} />
        <LegendItem className="bg-primary" label={t("logged")} />
        <LegendItem className="bg-status-attention" label={t("overPlan")} />
      </ul>
    </section>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-[3px] ${className}`} aria-hidden="true" />
      {label}
    </li>
  );
}
