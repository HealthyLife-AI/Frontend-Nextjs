"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LineChart } from "lucide-react";
import type { WeightTrendPoint } from "@/lib/progress/types";

const VIEW_W = 640;
const VIEW_H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

/**
 * FR-19 / S4-07: the client's weight over the selected window.
 *
 * One series, so there is no series legend — the card title names it.
 * The legend that IS here explains the MARKERS, which carry S4-18/BR-13:
 * a clinic analyser reading and the client's own scale end up in the same
 * series, and the nutritionist has to be able to tell which is which.
 * That distinction is encoded as marker SHAPE (filled vs hollow), not
 * hue, so it survives grayscale, print and every kind of color blindness.
 *
 * Points are placed by their real date, not by index: spacing eight
 * readings evenly would draw a two-month gap and a two-day gap the same
 * width and quietly misrepresent the trend.
 *
 * `dir="ltr"` on the plot even in Arabic — time reads left-to-right in a
 * chart regardless of the page's direction, which is the convention in
 * Arabic dashboards and clinical tools. Mirroring it would invert the
 * shape of a weight loss.
 */
export function WeightTrendChart({ points }: { points: WeightTrendPoint[] }) {
  const t = useTranslations("progress.weight");
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <EmptyPlot
        title={t("title")}
        message={t("emptyNoReadings")}
        hint={t("emptyNoReadingsHint")}
      />
    );
  }

  const weights = points.map((p) => p.weight_kg);
  const first = points[0];
  const last = points[points.length - 1];
  const change = points.length > 1 ? last.weight_kg - first.weight_kg : null;

  // A flat series would collapse to a zero-height scale; pad it so the
  // line sits mid-plot instead of on the axis.
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 2;
  const yMin = min - span * 0.2;
  const yMax = max + span * 0.2;

  const times = points.map((p) => new Date(p.recorded_at).getTime());
  const tMin = times[0];
  const tSpan = times[times.length - 1] - tMin || 1;

  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    points.length === 1 ? PAD.left + plotW / 2 : PAD.left + ((times[i] - tMin) / tSpan) * plotW;
  const y = (kg: number) => PAD.top + plotH - ((kg - yMin) / (yMax - yMin)) * plotH;

  const gridValues = [yMax, (yMax + yMin) / 2, yMin];
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.weight_kg)}`).join(" ");

  return (
    <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-xs text-ink-muted">{t("subtitle")}</p>
        </div>
        <dl className="flex gap-4 text-end">
          <Figure label={t("first")} value={`${first.weight_kg} ${t("kg")}`} />
          <Figure label={t("current")} value={`${last.weight_kg} ${t("kg")}`} />
          {change !== null && (
            <Figure
              label={t("change")}
              value={`${change > 0 ? "+" : ""}${change.toFixed(1)} ${t("kg")}`}
            />
          )}
        </dl>
      </header>

      {points.length === 1 && (
        <p className="mb-3 rounded-field bg-canvas px-3 py-2 text-xs text-ink-muted">
          {t("singleReading")}
        </p>
      )}

      {/*
        Scrolls rather than shrinking below `min-w`: a chart scaled to a
        390px phone renders its 10px axis labels at roughly 6px, which is
        not readable. Same treatment the client table already uses, and
        the one place the layout is allowed to exceed the viewport.
      */}
      <div className="relative overflow-x-auto" dir="ltr">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full min-w-[520px]"
          role="img"
          aria-label={t("ariaLabel", { count: points.length })}
        >
          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={VIEW_W - PAD.right}
                y1={y(value)}
                y2={y(value)}
                stroke="var(--color-divider)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(value) + 4}
                textAnchor="end"
                className="fill-[var(--color-ink-muted)] text-[10px] tabular-nums"
              >
                {value.toFixed(1)}
              </text>
            </g>
          ))}

          {points.length > 1 && (
            <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" />
          )}

          {points.map((point, i) => (
            <g key={point.recorded_at}>
              {/* Hit target deliberately larger than the 9px marker. */}
              <circle
                cx={x(i)}
                cy={y(point.weight_kg)}
                r={14}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <circle
                cx={x(i)}
                cy={y(point.weight_kg)}
                r={4.5}
                fill={point.source === "clinic-analyser" ? "var(--color-primary)" : "var(--color-card)"}
                stroke="var(--color-primary)"
                strokeWidth={2}
              />
            </g>
          ))}

          {/* Selective direct labels: the two ends, never every point. */}
          <text
            x={x(0)}
            y={y(first.weight_kg) - 12}
            textAnchor="middle"
            className="fill-[var(--color-ink-muted)] text-[10px] tabular-nums"
          >
            {first.recorded_at.slice(5)}
          </text>
          {points.length > 1 && (
            <text
              x={x(points.length - 1)}
              y={y(last.weight_kg) - 12}
              textAnchor="middle"
              className="fill-[var(--color-ink-muted)] text-[10px] tabular-nums"
            >
              {last.recorded_at.slice(5)}
            </text>
          )}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-field bg-ink px-2.5 py-1.5 text-xs text-card shadow-float"
            style={{
              left: `${(x(hovered) / VIEW_W) * 100}%`,
              top: `${(y(points[hovered].weight_kg) / VIEW_H) * 100}%`,
            }}
          >
            <span className="font-medium tabular-nums">
              {points[hovered].weight_kg} {t("kg")}
            </span>
            <span className="block text-[10px] opacity-80 tabular-nums">
              {points[hovered].recorded_at}
            </span>
            <span className="block text-[10px] opacity-80">
              {t(points[hovered].source === "clinic-analyser" ? "sourceClinic" : "sourceSelf")}
            </span>
          </div>
        )}
      </div>

      <SourceLegend />
    </section>
  );
}

/** BR-13: which instrument produced a reading, by shape rather than hue. */
function SourceLegend() {
  const t = useTranslations("progress.weight");

  return (
    <ul className="mt-3 flex flex-wrap gap-4 border-t border-divider pt-3 text-xs text-ink-muted">
      <li className="flex items-center gap-1.5">
        <svg width="12" height="12" aria-hidden="true">
          <circle cx="6" cy="6" r="4" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="2" />
        </svg>
        {t("sourceClinic")}
      </li>
      <li className="flex items-center gap-1.5">
        <svg width="12" height="12" aria-hidden="true">
          <circle cx="6" cy="6" r="4" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" />
        </svg>
        {t("sourceSelf")}
      </li>
    </ul>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

/**
 * S4-09: no readings is a real state a nutritionist will see on any new
 * client, not an error — an empty axis with no marks would read as a
 * broken chart.
 */
export function EmptyPlot({ title, message, hint }: { title: string; message: string; hint?: string }) {
  return (
    <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LineChart size={20} strokeWidth={1.75} />
        </div>
        <p className="text-sm text-ink-muted">{message}</p>
        {hint && <p className="max-w-xs text-xs text-ink-muted/80">{hint}</p>}
      </div>
    </section>
  );
}
