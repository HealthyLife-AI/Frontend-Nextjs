"use client";

import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { CompositionMetric, CompositionSnapshot } from "@/lib/progress/types";

/** Rendered in this order; each is omitted entirely when not measured. */
const METRICS: CompositionMetric[] = [
  "body_fat_percent",
  "muscle_mass_kg",
  "water_percent",
  "waist_cm",
  "hip_cm",
  "thigh_cm",
  "arm_cm",
];

const UNIT_KEY: Record<CompositionMetric, "percent" | "kg" | "cm"> = {
  weight_kg: "kg",
  body_fat_percent: "percent",
  muscle_mass_kg: "kg",
  water_percent: "percent",
  waist_cm: "cm",
  hip_cm: "cm",
  thigh_cm: "cm",
  arm_cm: "cm",
};

/**
 * S4-08 / FR-10: each measured metric with its change since the previous
 * reading.
 *
 * Deliberately NOT built on `StatTile` — that component is a value and a
 * label, and forcing a delta and a source badge into it would either
 * distort it for the dashboard that already uses it or produce a
 * half-card here. Same card/radius/shadow tokens, so the two still read
 * as one family.
 *
 * A metric absent from the latest reading is skipped rather than rendered
 * as 0: a remote client submits weight and circumferences only, so a
 * self-reported visit legitimately has no body-fat figure (BR-11), and
 * "0%" would be a fabricated measurement.
 *
 * A delta is shown only when BOTH readings carry the metric — the
 * backend's `change` already enforces that, and this mirrors it rather
 * than re-deriving it.
 */
export function BodyCompositionCards({
  latest,
  previous,
  change,
}: {
  latest: CompositionSnapshot | null;
  previous: CompositionSnapshot | null;
  change: Partial<Record<CompositionMetric, number>> | null;
}) {
  const t = useTranslations("progress.composition");

  if (latest === null) {
    return null;
  }

  const measured = METRICS.filter((metric) => latest[metric] !== null);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-xs text-ink-muted">{t("recordedAt", { date: latest.recorded_at })}</p>
        </div>
        {/* BR-13: which instrument produced the reading these cards show. */}
        <Badge tone={latest.source === "clinic-analyser" ? "primary" : "neutral"}>
          {t(latest.source === "clinic-analyser" ? "sourceClinic" : "sourceSelf")}
        </Badge>
      </div>

      {measured.length === 0 ? (
        <p className="rounded-panel border border-border/70 bg-card p-4 text-sm text-ink-muted shadow-panel">
          {t("emptyWeightOnly")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {measured.map((metric) => (
            <MetricCard
              key={metric}
              label={t(metric)}
              value={latest[metric] as number}
              unit={t(`unit.${UNIT_KEY[metric]}`)}
              delta={change?.[metric] ?? null}
              previousLabel={
                previous && previous[metric] !== null
                  ? t("since", { date: previous.recorded_at })
                  : null
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  unit,
  delta,
  previousLabel,
}: {
  label: string;
  value: number;
  unit: string;
  delta: number | null;
  previousLabel: string | null;
}) {
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-panel border border-border/70 bg-card p-4 shadow-panel">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
        {value}
        <span className="ms-1 text-xs font-normal text-ink-muted">{unit}</span>
      </p>

      {/*
        The arrow states the direction of the change and nothing more.
        Whether "down" is good depends on the metric and the client's own
        goal — fat down is progress, muscle down is not — so this is
        deliberately not colored good/bad.
      */}
      {delta !== null && previousLabel && (
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
          <DeltaIcon size={14} strokeWidth={2} className="rtl:-scale-x-100" />
          <span className="tabular-nums">
            {delta > 0 ? "+" : ""}
            {delta} {unit}
          </span>
          <span className="truncate">· {previousLabel}</span>
        </p>
      )}
    </div>
  );
}
