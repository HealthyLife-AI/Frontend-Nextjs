"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { ApiError } from "@/lib/api";
import type { CatalogFood, FoodInput } from "@/lib/foods/api";

type Values = Record<
  "name_ar" | "name_en" | "calories_per_100g" | "protein_g_per_100g" | "carbs_g_per_100g" | "fat_g_per_100g" | "fiber_g_per_100g",
  string
>;

const NUMERIC = ["calories_per_100g", "protein_g_per_100g", "carbs_g_per_100g", "fat_g_per_100g", "fiber_g_per_100g"] as const;

function initial(food?: CatalogFood | null): Values {
  const v = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
  return {
    name_ar: food?.name_ar ?? "",
    name_en: food?.name_en ?? "",
    calories_per_100g: v(food?.calories_per_100g),
    protein_g_per_100g: v(food?.protein_g_per_100g),
    carbs_g_per_100g: v(food?.carbs_g_per_100g),
    fat_g_per_100g: v(food?.fat_g_per_100g),
    fiber_g_per_100g: v(food?.fiber_g_per_100g),
  };
}

/**
 * Food fields shared by the nutritionist's "submit a food" and the
 * admin's add/edit: at least one name (Arabic or English), macros per
 * 100g. Server-side validation errors land under their field.
 */
export function FoodForm({
  food,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  food?: CatalogFood | null;
  submitLabel: string;
  onSubmit: (payload: FoodInput) => Promise<{ ok: true } | { ok: false; error: ApiError }>;
  onCancel?: () => void;
}) {
  const t = useTranslations("foods.form");
  const [values, setValues] = useState<Values>(() => initial(food));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    if (!values.name_ar.trim() && !values.name_en.trim()) {
      setErrors({ name_ar: t("nameRequired") });
      return;
    }

    const payload: FoodInput = {
      name_ar: values.name_ar.trim() || null,
      name_en: values.name_en.trim() || null,
      calories_per_100g: Number(values.calories_per_100g),
      protein_g_per_100g: Number(values.protein_g_per_100g),
      carbs_g_per_100g: Number(values.carbs_g_per_100g),
      fat_g_per_100g: Number(values.fat_g_per_100g),
      fiber_g_per_100g: values.fiber_g_per_100g === "" ? null : Number(values.fiber_g_per_100g),
    };

    setBusy(true);
    const result = await onSubmit(payload);
    setBusy(false);

    if (!result.ok) {
      const fieldErrors = Object.fromEntries(
        Object.entries(result.error.errors ?? {}).map(([k, v]) => [k, v[0]])
      );
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(result.error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={t("nameAr")} value={values.name_ar} onChange={set("name_ar")} error={errors.name_ar} dir="rtl" />
        <TextField label={t("nameEn")} value={values.name_en} onChange={set("name_en")} error={errors.name_en} dir="ltr" />
      </div>

      <p className="text-xs font-semibold text-ink-muted">{t("per100g")}</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {NUMERIC.map((key) => (
          <TextField
            key={key}
            label={t(key)}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            required={key !== "fiber_g_per_100g"}
            value={values[key]}
            onChange={set(key)}
            error={errors[key]}
            dir="ltr"
          />
        ))}
      </div>

      {formError && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            {t("cancel")}
          </Button>
        )}
        <Button type="submit" isLoading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
