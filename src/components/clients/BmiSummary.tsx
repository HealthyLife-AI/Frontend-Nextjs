"use client";

import { useLocale, useTranslations } from "next-intl";
import { bmiCategory, computeBmi } from "@/lib/clients/bmi";

/**
 * Item B: the latest BMI the nutritionist entered, with the date of that
 * reading and its WHO band.
 *
 * With nothing entered it falls back to weight ÷ height² and says so
 * ("محسوب") rather than showing a bare number — she needs to know at a
 * glance whether she is reading her own figure or the app's arithmetic.
 *
 * Under 18 the number is shown with no band: a child's BMI is read off
 * age-and-sex percentile charts, not the adult cut-offs.
 */
export function BmiSummary({
  enteredBmi,
  recordedAt,
  weightKg,
  heightCm,
  age,
  className = "",
}: {
  enteredBmi: number | null | undefined;
  recordedAt: string | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  className?: string;
}) {
  const t = useTranslations("clients.bmi");
  const locale = useLocale();

  const computed = computeBmi(weightKg, heightCm);
  const value = enteredBmi ?? computed;
  if (value === null) return null;

  const isComputed = enteredBmi === null || enteredBmi === undefined;
  const category = bmiCategory(value, age);
  const date =
    !isComputed && recordedAt
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(`${recordedAt}T12:00:00`))
      : null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className="font-bold tabular-nums text-ink">{value}</span>
      {category && <span className="rounded-full bg-ink-muted/10 px-2 py-0.5 text-xs font-semibold text-ink-muted">{t(category)}</span>}
      {isComputed && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{t("computed")}</span>}
      {date && <span className="text-xs text-ink-muted">{date}</span>}
    </span>
  );
}
