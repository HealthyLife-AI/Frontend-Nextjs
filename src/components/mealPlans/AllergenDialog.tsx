"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { AllergenSeverity } from "@/lib/mealPlans/types";

/** One conflict as the dialog lists it: the food, where it sits, and what it conflicts with. */
export type DialogConflict = {
  key: string;
  foodName: string;
  mealLabel: string;
  groups: string[];
  severity: AllergenSeverity;
  isAlternative: boolean;
};

/**
 * Pilot feedback 2, C1: the patient's current medications, names only.
 *
 * Information, not advice: there is no interaction database here and none
 * is implied. It cannot be dismissed — it is a reminder to do the check she
 * is trained to do, shown for as long as the patient is on anything — and it
 * is never printed or shown to the patient (it lives only in the designer
 * and its activation dialog).
 */
export function MedicationNotice({ names }: { names: string[] }) {
  const t = useTranslations("medicationNotice");

  if (names.length === 0) return null;

  return (
    <div role="note" className="flex items-start gap-2.5 rounded-field border border-primary/25 bg-primary/[0.06] px-3.5 py-3 text-sm text-ink">
      <Info size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <p className="leading-relaxed">
        <span className="font-semibold">{t("takes", { names: names.join("، ") })}</span> {t("review")}
      </p>
    </div>
  );
}

/**
 * The activation dialog (pilot feedback 2, A5 and C1), also used to record a
 * review of an ACTIVE plan's conflicts.
 *
 * Confirmed-allergy conflicts need an explicit tick — "I reviewed the
 * conflict and I take responsibility for keeping it" — before the confirm
 * button works. Intolerances and foods to avoid are listed but never need
 * one. With only medications to show, it is a plain confirm.
 */
export function AllergenConfirmDialog({
  open,
  mode,
  conflicts,
  medications,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  /** "activate": approving a plan. "acknowledge": recording a review of the plan already in force. */
  mode: "activate" | "acknowledge";
  conflicts: DialogConflict[];
  medications: string[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("allergenDialog");
  const tGroup = useTranslations("healthRecords.group");
  const tSeverity = useTranslations("allergenWarning");
  const [reviewed, setReviewed] = useState(false);

  const needsTick = conflicts.some((c) => c.severity === "confirmed_allergy");
  const canConfirm = !needsTick || reviewed;

  return (
    <Dialog open={open} onClose={onCancel} busy={busy} size="lg" title={mode === "acknowledge" ? t("titleAcknowledge") : t("titleActivate")}>
      <div className="flex flex-col gap-4">
        <MedicationNotice names={medications} />

        {conflicts.length > 0 && (
          <>
            <p className="text-sm text-ink-muted">{needsTick ? t("bodyConfirmed") : t("bodySoft")}</p>

            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {conflicts.map((c) => {
                const red = c.severity === "confirmed_allergy";
                const Icon = red ? ShieldAlert : AlertTriangle;

                return (
                  <li
                    key={c.key}
                    className={`flex items-start gap-2.5 rounded-field border px-3 py-2.5 ${
                      red ? "border-status-late/30 bg-status-late-bg" : "border-status-attention/30 bg-status-attention-bg"
                    }`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${red ? "text-status-late" : "text-status-attention"}`} aria-hidden="true" />
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold text-ink">
                        {c.foodName}
                        <span className="ms-2 text-xs font-normal text-ink-muted">
                          {c.mealLabel}
                          {c.isAlternative ? ` · ${t("alternative")}` : ""}
                        </span>
                      </p>
                      <p className={red ? "text-status-late" : "text-status-attention"}>
                        {c.groups.map((g) => tGroup(g)).join("، ")} — {tSeverity(c.severity)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {needsTick && (
          <label className="flex items-start gap-2.5 rounded-field border border-border bg-canvas/60 p-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            {t("tick")}
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} isLoading={busy} disabled={!canConfirm}>
            {mode === "acknowledge" ? t("confirmAcknowledge") : t("confirmActivate")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
