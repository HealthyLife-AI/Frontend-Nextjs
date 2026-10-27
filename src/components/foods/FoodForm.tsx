"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import type { ApiError } from "@/lib/api";
import { formatLongDate } from "@/lib/format/date";
import { COST_TIERS, FOOD_ALLERGENS, PREP_LEVELS, SHOPPING_SECTIONS, type CatalogFood, type FoodInput } from "@/lib/foods/api";

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

const text = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

/**
 * Food fields shared by the nutritionist's "submit a food" and the
 * admin's add/edit: at least one name (Arabic or English), macros per
 * 100g, and the optional extra values (glycemic index, sodium, their
 * source, cost tier, prep level). Server-side validation errors land under
 * their field.
 *
 * A nutritionist's extras are SUGGESTIONS in a collapsed section: the admin
 * reviews them. For the admin the same fields sit open next to the allergen
 * groups, with who last reviewed them. On an edit only the glycemic index and
 * sodium the admin actually changed are sent: sending them is what stamps the
 * review, so an edit of something else must not.
 */
export function FoodForm({
  food,
  submitLabel,
  onSubmit,
  onCancel,
  withTags = false,
}: {
  food?: CatalogFood | null;
  submitLabel: string;
  onSubmit: (payload: FoodInput) => Promise<{ ok: true } | { ok: false; error: ApiError }>;
  onCancel?: () => void;
  /** Admin: also edit allergen groups and the shopping-list section, and the extras are open. */
  withTags?: boolean;
}) {
  const t = useTranslations("foods.form");
  const tGroup = useTranslations("healthRecords.group");
  const locale = useLocale();
  const [allergens, setAllergens] = useState<string[]>(food?.allergens ?? []);
  const [section, setSection] = useState<string>(food?.shopping_section ?? "other");
  const [costTier, setCostTier] = useState<string>(food?.cost_tier ?? "");
  const [prepLevel, setPrepLevel] = useState<string>(food?.prep_level ?? "");
  const [gi, setGi] = useState(text(food?.glycemic_index));
  const [sodium, setSodium] = useState(text(food?.sodium_mg_per_100g));
  const [source, setSource] = useState(food?.nutrition_review_source ?? "");
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

    // A value from a published table needs its source.
    if ((gi.trim() !== "" || sodium.trim() !== "") && source.trim() === "") {
      setErrors({ nutrition_review_source: t("sourceRequired") });
      return;
    }

    // New food: what is filled in. Edit: what changed (and an explicit null when it was emptied).
    const value = (now: string, before: number | null | undefined): { send: boolean; value: number | null } => ({
      send: food ? now.trim() !== text(before) : now.trim() !== "",
      value: now.trim() === "" ? null : Number(now),
    });
    const giPart = value(gi, food?.glycemic_index);
    const sodiumPart = value(sodium, food?.sodium_mg_per_100g);
    const sourceChanged = food ? source.trim() !== (food.nutrition_review_source ?? "") : source.trim() !== "";

    const payload: FoodInput = {
      name_ar: values.name_ar.trim() || null,
      name_en: values.name_en.trim() || null,
      calories_per_100g: Number(values.calories_per_100g),
      protein_g_per_100g: Number(values.protein_g_per_100g),
      carbs_g_per_100g: Number(values.carbs_g_per_100g),
      fat_g_per_100g: Number(values.fat_g_per_100g),
      fiber_g_per_100g: values.fiber_g_per_100g === "" ? null : Number(values.fiber_g_per_100g),
      cost_tier: costTier === "" ? null : costTier,
      prep_level: prepLevel === "" ? null : prepLevel,
      ...(giPart.send ? { glycemic_index: giPart.value } : {}),
      ...(sodiumPart.send ? { sodium_mg_per_100g: sodiumPart.value } : {}),
      ...(giPart.send || sodiumPart.send || sourceChanged ? { nutrition_review_source: source.trim() === "" ? null : source.trim() } : {}),
      ...(withTags ? { allergens, shopping_section: section } : {}),
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

  const extras = (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <TextField
            label={t("glycemicIndex")}
            type="number"
            inputMode="numeric"
            min={0}
            max={110}
            step="1"
            value={gi}
            onChange={(e) => setGi(e.target.value)}
            error={errors.glycemic_index}
            dir="ltr"
          />
          <p className="text-xs leading-relaxed text-ink-muted">{t("glycemicHint")}</p>
        </div>
        <TextField
          label={t("sodium")}
          type="number"
          inputMode="decimal"
          min={0}
          max={40000}
          step="0.1"
          value={sodium}
          onChange={(e) => setSodium(e.target.value)}
          error={errors.sodium_mg_per_100g}
          dir="ltr"
        />
      </div>
      <TextField
        label={t("source")}
        value={source}
        maxLength={255}
        onChange={(e) => setSource(e.target.value)}
        error={errors.nutrition_review_source}
        hint={gi.trim() !== "" || sodium.trim() !== "" ? t("sourceRequired") : undefined}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label={t("costTier")} value={costTier} onChange={(e) => setCostTier(e.target.value)} error={errors.cost_tier}>
          <option value="">{t("notSet")}</option>
          {COST_TIERS.map((c) => (
            <option key={c} value={c}>
              {t(`cost.${c}`)}
            </option>
          ))}
        </Select>
        <Select label={t("prepLevel")} value={prepLevel} onChange={(e) => setPrepLevel(e.target.value)} error={errors.prep_level}>
          <option value="">{t("notSet")}</option>
          {PREP_LEVELS.map((p) => (
            <option key={p} value={p}>
              {t(`prep.${p}`)}
            </option>
          ))}
        </Select>
      </div>
      {food?.nutrition_reviewed_at && (
        <p className="text-xs text-ink-muted">
          {t("lastReview", { name: food.nutrition_reviewer_name ?? "—", date: formatLongDate(food.nutrition_reviewed_at.slice(0, 10), locale) })}
        </p>
      )}
    </div>
  );

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

      {withTags ? (
        <div className="flex flex-col gap-3 border-t border-divider pt-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("allergens")}</legend>
            <div className="flex flex-wrap gap-2">
              {FOOD_ALLERGENS.map((g) => (
                <label key={g} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-ink has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={allergens.includes(g)}
                    onChange={(e) => setAllergens((prev) => (e.target.checked ? [...prev, g] : prev.filter((x) => x !== g)))}
                  />
                  {tGroup(g)}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-muted">{t("allergensHint")}</p>
          </fieldset>
          <Select label={t("shoppingSection")} value={section} onChange={(e) => setSection(e.target.value)}>
            {SHOPPING_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`section.${s}`)}
              </option>
            ))}
          </Select>
          <p className="pt-1 text-sm font-medium text-ink">{t("extraTitle")}</p>
          {extras}
        </div>
      ) : (
        <details className="rounded-field border border-border/70 px-4 py-3" open={Boolean(errors.nutrition_review_source || errors.glycemic_index || errors.sodium_mg_per_100g)}>
          <summary className="cursor-pointer text-sm font-semibold text-ink">{t("extraTitle")}</summary>
          <div className="pt-3">{extras}</div>
        </details>
      )}

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
