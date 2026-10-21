"use client";

import { useTranslations } from "next-intl";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PatientTips } from "@/lib/conditions/api";

/**
 * Clinical batch 1, D3: text written FOR the patient. Unlike the private
 * summary above it, this reaches the patient's app and the printed sheet,
 * and the card says so. The chips are ready-made tips for this patient's
 * conditions (and one general tip): clicking one appends it as a new line,
 * and she edits whatever is inserted before saving.
 */
export function PatientInstructionsCard({
  value,
  onChange,
  tips,
  onSave,
  saving,
}: {
  value: string;
  onChange: (value: string) => void;
  tips: PatientTips | null;
  /** Given on the ACTIVE plan, where the text is saved on its own; a draft saves it with the plan. */
  onSave?: () => void;
  saving?: boolean;
}) {
  const t = useTranslations("patientInstructions");

  function append(tip: string) {
    if (value.includes(tip)) return;
    onChange(value.trim() === "" ? tip : `${value.replace(/\s+$/, "")}\n${tip}`);
  }

  const groups = [
    ...(tips?.conditions ?? []).map((c) => ({ key: c.code, label: c.label, tips: c.tips })),
    ...(tips && tips.general.length > 0 ? [{ key: "general", label: t("general"), tips: tips.general }] : []),
  ];

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">{t("title")}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Eye size={12} strokeWidth={2.2} aria-hidden="true" />
          {t("visibleTag")}
        </span>
      </div>

      {groups.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-ink-muted">{t("tipsHint")}</p>
          {groups.map((g) => (
            <div key={g.key} className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-ink-muted">{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.tips.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => append(tip)}
                    disabled={value.includes(tip)}
                    title={tip}
                    className="inline-flex max-w-full items-start gap-1 rounded-field border border-primary/25 bg-primary/[0.05] px-2.5 py-1.5 text-start text-xs text-ink hover:bg-primary/10 disabled:opacity-50"
                  >
                    <Plus size={12} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="line-clamp-2">{tip}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea
        id="patient-instructions"
        rows={5}
        maxLength={2000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("title")}
        className="rounded-field border border-border bg-canvas/60 p-3 text-sm leading-relaxed text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
      />
      <p className="text-xs text-ink-muted">{t("visibleNote")}</p>

      {onSave && (
        <div className="flex justify-end">
          <Button variant="secondary" isLoading={saving} onClick={onSave}>
            {t("save")}
          </Button>
        </div>
      )}
    </section>
  );
}
