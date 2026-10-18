"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Item C: the nutritionist's decision about this plan — the calorie
 * target she is actually prescribing, and why.
 *
 * Shown above the meals because it is the decision the meals are built
 * to, with the formula's figure beside it as a suggestion rather than
 * as the target: Mifflin-St Jeor does not know about the pregnancy, the
 * thyroid result or the Ramadan schedule she does.
 *
 * Both fields are hers alone — tagged as such in the card, and stripped
 * from every client response by MealPlanResource.
 */
export function PlanDecisionCard({
  approvedCalories,
  onApprovedCaloriesChange,
  summary,
  onSummaryChange,
  suggestion,
  floor,
  children,
}: {
  approvedCalories: string;
  onApprovedCaloriesChange: (value: string) => void;
  summary: string;
  onSummaryChange: (value: string) => void;
  /** The formula's figure, shown beside her field. Null when there's no health profile yet. */
  suggestion: number | null;
  /**
   * This patient's gender's floor from `calorie_floor` on the health-profile
   * response (backend config/nutrition.php, the only source). Null when the
   * profile or gender is unknown, and then no warning shows.
   */
  floor: number | null;
  /** The "suggest a summary" action (Item D) sits in this card's footer. */
  children?: React.ReactNode;
}) {
  const t = useTranslations("planDesigner.decision");

  const entered = approvedCalories ? Number(approvedCalories) : null;
  // Soft only: approving a lower target is a clinical call (a short
  // protocol, a small patient) and the app has no standing to block it.
  const belowFloor = entered !== null && floor !== null && entered < floor;

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-primary/20 bg-primary/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">{t("title")}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-muted/10 px-2.5 py-1 text-xs font-semibold text-ink-muted">
          <Lock size={12} strokeWidth={2.2} aria-hidden="true" />
          {t("privateTag")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="approved-calories" className="text-sm font-semibold text-ink">
            {t("approvedCalories")}
          </label>
          <input
            id="approved-calories"
            type="number"
            inputMode="numeric"
            min={800}
            max={6000}
            step={10}
            value={approvedCalories}
            placeholder={suggestion !== null ? String(suggestion) : undefined}
            onChange={(e) => onApprovedCaloriesChange(e.target.value)}
            className="h-12 w-full rounded-field border border-border bg-canvas/60 px-3.5 text-sm tabular-nums text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
          {suggestion !== null && (
            <p className="text-xs text-ink-muted">{t("systemSuggestion", { value: suggestion })}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-summary" className="text-sm font-semibold text-ink">
            {t("summary")}
          </label>
          <textarea
            id="plan-summary"
            rows={3}
            maxLength={1000}
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="rounded-field border border-border bg-canvas/60 p-3 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      {belowFloor && (
        <p role="status" className="rounded-field border border-status-attention/25 bg-status-attention-bg px-3.5 py-2.5 text-sm text-ink">
          {t("belowFloor", { value: floor ?? 0 })}
        </p>
      )}

      {children}
    </section>
  );
}
