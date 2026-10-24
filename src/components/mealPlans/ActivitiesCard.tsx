"use client";

import { useTranslations } from "next-intl";
import { Activity, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PlanActivity, PlanActivityInput } from "@/lib/mealPlans/types";

/** One row as typed: strings, so a half-typed number is never rewritten under the cursor. */
export type EditableActivity = {
  key: string;
  title: string;
  description: string;
  duration: string;
  times: string;
  days: string;
};

let counter = 0;
const nextKey = () => `act-${Date.now()}-${counter++}`;

export const blankActivity = (): EditableActivity => ({ key: nextKey(), title: "", description: "", duration: "30", times: "1", days: "" });

export function activitiesFromPlan(list: PlanActivity[] | undefined): EditableActivity[] {
  return (list ?? []).map((a) => ({
    key: nextKey(),
    title: a.title,
    description: a.description ?? "",
    duration: String(a.duration_minutes),
    times: String(a.times_per_day),
    days: a.days_per_week === null ? "" : String(a.days_per_week),
  }));
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(value)));

/**
 * What is sent: rows with a title, numbers kept inside the ranges the API
 * accepts (1–300 minutes, 1–6 times a day, 1–7 days a week). A row with no
 * title is a blank draft and is left out rather than failing the save.
 */
export function activitiesToInput(rows: EditableActivity[]): PlanActivityInput[] {
  return rows
    .filter((r) => r.title.trim() !== "")
    .map((r) => ({
      title: r.title.trim().slice(0, 120),
      description: r.description.trim() === "" ? null : r.description.trim().slice(0, 1000),
      duration_minutes: clamp(Number(r.duration) || 30, 1, 300),
      times_per_day: clamp(Number(r.times) || 1, 1, 6),
      days_per_week: r.days.trim() === "" ? null : clamp(Number(r.days) || 1, 1, 7),
    }));
}

const EXAMPLES: { id: "walk" | "stretch" | "stairs"; duration: string; times: string; days: string }[] = [
  { id: "walk", duration: "30", times: "1", days: "5" },
  { id: "stretch", duration: "10", times: "2", days: "" },
  { id: "stairs", duration: "10", times: "1", days: "" },
];

const field =
  "h-10 w-full min-w-0 rounded-field border border-border bg-canvas/60 px-3 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10";

/**
 * Phase 1, A4: the physical activity prescribed with the plan. Rows are
 * title / description / minutes / times a day / days a week; the chips add a
 * ready example that she edits afterwards. No calorie-burn arithmetic, on
 * purpose. Written for the patient, so it says it is shown in the app and on
 * the printout. On the ACTIVE plan it saves on its own (no re-activation).
 */
export function ActivitiesCard({
  rows,
  onChange,
  onSave,
  saving,
}: {
  rows: EditableActivity[];
  onChange: (rows: EditableActivity[]) => void;
  onSave?: () => void;
  saving?: boolean;
}) {
  const t = useTranslations("activities");

  const update = (key: string, patch: Partial<EditableActivity>) => onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <Activity size={16} className="text-primary" aria-hidden="true" />
          {t("title")}
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Eye size={12} strokeWidth={2.2} aria-hidden="true" />
          {t("visibleTag")}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-ink-muted">{t("examplesHint")}</p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onChange([...rows, { key: nextKey(), title: t(`example.${e.id}`), description: "", duration: e.duration, times: e.times, days: e.days }])}
              className="inline-flex items-center gap-1 rounded-field border border-primary/25 bg-primary/[0.05] px-2.5 py-1.5 text-xs text-ink hover:bg-primary/10"
            >
              <Plus size={12} className="text-primary" aria-hidden="true" />
              {t(`example.${e.id}`)}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && <p className="text-sm text-ink-muted">{t("empty")}</p>}

      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={r.key} className="flex flex-col gap-2 rounded-field border border-border/70 bg-canvas/40 p-3">
            <div className="flex items-center gap-2">
              <input
                value={r.title}
                maxLength={120}
                onChange={(e) => update(r.key, { title: e.target.value })}
                placeholder={t("titlePlaceholder")}
                aria-label={t("titleLabel", { number: i + 1 })}
                className={field}
              />
              <button
                type="button"
                onClick={() => onChange(rows.filter((x) => x.key !== r.key))}
                aria-label={t("remove", { number: i + 1 })}
                className="shrink-0 text-ink-muted hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              value={r.description}
              maxLength={1000}
              rows={2}
              onChange={(e) => update(r.key, { description: e.target.value })}
              placeholder={t("descriptionPlaceholder")}
              aria-label={t("descriptionLabel", { number: i + 1 })}
              className="rounded-field border border-border bg-canvas/60 p-3 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
                {t("minutes")}
                <input type="number" min={1} max={300} value={r.duration} onChange={(e) => update(r.key, { duration: e.target.value })} className={`${field} tabular-nums`} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
                {t("timesPerDay")}
                <input type="number" min={1} max={6} value={r.times} onChange={(e) => update(r.key, { times: e.target.value })} className={`${field} tabular-nums`} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
                {t("daysPerWeek")}
                <input type="number" min={1} max={7} value={r.days} placeholder={t("everyDay")} onChange={(e) => update(r.key, { days: e.target.value })} className={`${field} tabular-nums`} />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => onChange([...rows, blankActivity()])}>
          <Plus size={16} aria-hidden="true" />
          {t("add")}
        </Button>
        {onSave && (
          <Button variant="secondary" isLoading={saving} onClick={onSave}>
            {t("save")}
          </Button>
        )}
      </div>
      <p className="text-xs text-ink-muted">{t("visibleNote")}</p>
    </section>
  );
}
