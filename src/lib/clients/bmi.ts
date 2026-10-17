/**
 * BMI arithmetic, mirroring App\Support\Bmi on the backend so the
 * suggestion the form offers and the figure the API labels can't drift.
 *
 * The nutritionist's own entered value is always what gets saved; this
 * only produces the number offered beside it and the band it falls in.
 */

export type BmiCategory = "underweight" | "normal" | "overweight" | "obesity";

/** weight ÷ (height in metres)², one decimal. Null when either figure is missing. */
export function computeBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;

  const metres = heightCm / 100;
  return Math.round((weightKg / metres ** 2) * 10) / 10;
}

/**
 * The WHO band, adults only. Under 18 a BMI is read against age-and-sex
 * percentile charts, so the number is shown without a label rather than
 * calling a 14-year-old obese off an adult table.
 */
export function bmiCategory(bmi: number | null, age: number | null): BmiCategory | null {
  if (bmi === null || age === null || age < 18) return null;
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obesity";
}

/** Above this gap the form asks her to re-check, but never blocks the save. */
export const BMI_REVIEW_GAP = 1.0;

export function bmiNeedsReview(entered: number | null, computed: number | null): boolean {
  return entered !== null && computed !== null && Math.abs(entered - computed) > BMI_REVIEW_GAP;
}
