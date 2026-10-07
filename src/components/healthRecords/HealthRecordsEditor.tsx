"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Pill, Plus, ShieldAlert, Target, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import {
  ALLERGY_CLASSES,
  ALLERGY_GROUPS,
  GOAL_TYPES,
  TIMINGS,
  addAllergy,
  addMedication,
  archiveMedication,
  getHealthRecords,
  removeAllergy,
  reviewMedication,
  saveGoal,
  type AllergyClass,
  type AllergyGroup,
  type GoalType,
  type HealthRecords,
  type Timing,
} from "@/lib/healthRecords/api";

const section = "rounded-panel border border-border/70 bg-card p-5 shadow-panel";

/**
 * The nutritionist's direct edits to the patient's goal, medications and
 * allergies (they apply at once; the patient's own changes arrive as
 * proposals on the patient page). Information only: the app never advises
 * on medications.
 */
export function HealthRecordsEditor({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("healthRecords");
  const { authorizedFetch } = useAuth();
  const [records, setRecords] = useState<HealthRecords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [goalType, setGoalType] = useState<GoalType>("weight_loss");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [trainingDays, setTrainingDays] = useState("");

  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFrequency, setMedFrequency] = useState("");
  const [medTiming, setMedTiming] = useState<Timing>("any");

  const [allergyGroup, setAllergyGroup] = useState<AllergyGroup>("milk_lactose");
  const [allergyText, setAllergyText] = useState("");
  const [allergyClass, setAllergyClass] = useState<AllergyClass>("confirmed_allergy");

  async function reload() {
    const r = await getHealthRecords(authorizedFetch, subscriberId);
    if (!r.ok) {
      setError(t("loadFailed"));
      return;
    }
    setRecords(r.data);
    if (r.data.goal) {
      setGoalType(r.data.goal.goal_type);
      setTargetWeight(r.data.goal.target_weight_kg?.toString() ?? "");
      setTargetDate(r.data.goal.target_date ?? "");
      setTrainingDays(r.data.goal.training_days_per_week?.toString() ?? "");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriberId]);

  function report(ok: boolean, message?: string) {
    setError(ok ? null : message || t("saveFailed"));
    setNotice(ok ? t("saved") : null);
    if (ok) reload();
  }

  async function submitGoal() {
    const r = await saveGoal(authorizedFetch, subscriberId, {
      goal_type: goalType,
      target_weight_kg: targetWeight ? Number(targetWeight) : null,
      target_date: targetDate || null,
      training_days_per_week: trainingDays ? Number(trainingDays) : null,
    });
    report(r.ok, r.ok ? undefined : r.error.message);
  }

  async function submitMedication() {
    if (!medName.trim()) return;
    const r = await addMedication(authorizedFetch, subscriberId, { name: medName.trim(), dose: medDose || null, frequency: medFrequency || null, timing: medTiming });
    if (r.ok) {
      setMedName("");
      setMedDose("");
      setMedFrequency("");
    }
    report(r.ok, r.ok ? undefined : r.error.message);
  }

  async function submitAllergy() {
    const r = await addAllergy(authorizedFetch, subscriberId, { group: allergyGroup, other_text: allergyGroup === "other" ? allergyText : null, class: allergyClass });
    if (r.ok) setAllergyText("");
    const code = !r.ok ? (r.error as { code?: string }).code : undefined;
    report(r.ok, code === "already_recorded" ? t("alreadyRecorded") : r.ok ? undefined : r.error.message);
  }

  if (!records) {
    return <div className={`${section} text-sm text-ink-muted`}>{error ?? "…"}</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {(error || notice) && (
        <p role={error ? "alert" : "status"} className={`rounded-field px-3.5 py-2.5 text-sm ${error ? "bg-status-late-bg text-status-late" : "bg-status-on-track-bg text-status-on-track"}`}>
          {error ?? notice}
        </p>
      )}

      <section className={section}>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
          <Target size={18} className="text-primary" aria-hidden="true" />
          {t("goalTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label={t("goalType")} value={goalType} onChange={(e) => setGoalType(e.target.value as GoalType)}>
            {GOAL_TYPES.map((g) => (
              <option key={g} value={g}>
                {t(`goal.${g}`)}
              </option>
            ))}
          </Select>
          <TextField label={t("targetWeight")} type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          <TextField label={t("targetDate")} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <TextField label={t("trainingDays")} type="number" min="0" max="7" value={trainingDays} onChange={(e) => setTrainingDays(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" onClick={submitGoal}>
            {t("saveGoal")}
          </Button>
        </div>
      </section>

      <section className={section}>
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink">
          <Pill size={18} className="text-primary" aria-hidden="true" />
          {t("medicationsTitle")}
        </h2>
        <p className="mb-4 text-xs text-ink-muted">{t("medicationsHint")}</p>
        <ul className="flex flex-col gap-2">
          {records.medications.length === 0 && <li className="text-sm text-ink-muted">{t("none")}</li>}
          {records.medications.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 rounded-field border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="text-xs text-ink-muted">{[m.dose, m.frequency, t(`timing.${m.timing}`)].filter(Boolean).join(" · ")}</p>
                {m.reviewed_at && <p className="mt-1 text-xs text-status-on-track">{t("reviewed", { note: m.review_note ?? "" })}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                {!m.reviewed_at && (
                  <button
                    type="button"
                    onClick={async () => {
                      const note = window.prompt(t("reviewPrompt")) ?? null;
                      const r = await reviewMedication(authorizedFetch, subscriberId, m.id, note || null);
                      report(r.ok);
                    }}
                    className="inline-flex h-9 items-center gap-1 rounded-control border border-border px-3 text-xs font-semibold text-ink-muted hover:text-primary"
                  >
                    <CheckCircle2 size={14} />
                    {t("markReviewed")}
                  </button>
                )}
                <button type="button" aria-label={t("remove")} onClick={async () => report(await archiveMedication(authorizedFetch, subscriberId, m.id))} className="text-ink-muted hover:text-status-late">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <TextField label={t("medName")} value={medName} onChange={(e) => setMedName(e.target.value)} maxLength={100} />
          <TextField label={t("medDose")} value={medDose} onChange={(e) => setMedDose(e.target.value)} maxLength={100} />
          <TextField label={t("medFrequency")} value={medFrequency} onChange={(e) => setMedFrequency(e.target.value)} maxLength={100} />
          <Select label={t("medTiming")} value={medTiming} onChange={(e) => setMedTiming(e.target.value as Timing)}>
            {TIMINGS.map((x) => (
              <option key={x} value={x}>
                {t(`timing.${x}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" className="mt-3 w-fit" onClick={submitMedication} disabled={!medName.trim()}>
          <Plus size={16} />
          {t("addMedication")}
        </Button>
      </section>

      <section className={section}>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
          <ShieldAlert size={18} className="text-primary" aria-hidden="true" />
          {t("allergiesTitle")}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {records.allergies.length === 0 && <li className="text-sm text-ink-muted">{t("none")}</li>}
          {records.allergies.map((a) => (
            <li key={a.id} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-canvas px-3 py-1.5 text-sm">
              <span className="font-medium text-ink">{a.label}</span>
              <Badge tone={a.class === "confirmed_allergy" ? "danger" : a.class === "intolerance" ? "warning" : "neutral"}>{t(`class.${a.class}`)}</Badge>
              <button
                type="button"
                aria-label={t("remove")}
                onClick={async () => {
                  if (a.class === "confirmed_allergy" && !window.confirm(t("confirmRemoveAllergy", { name: a.label }))) return;
                  report(await removeAllergy(authorizedFetch, subscriberId, a.id));
                }}
                className="text-ink-muted hover:text-status-late"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Select label={t("allergyGroup")} value={allergyGroup} onChange={(e) => setAllergyGroup(e.target.value as AllergyGroup)}>
            {ALLERGY_GROUPS.map((g) => (
              <option key={g} value={g}>
                {t(`group.${g}`)}
              </option>
            ))}
          </Select>
          {allergyGroup === "other" && <TextField label={t("allergyOther")} value={allergyText} onChange={(e) => setAllergyText(e.target.value)} maxLength={100} />}
          <Select label={t("allergyClass")} value={allergyClass} onChange={(e) => setAllergyClass(e.target.value as AllergyClass)}>
            {ALLERGY_CLASSES.map((c) => (
              <option key={c} value={c}>
                {t(`class.${c}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" className="mt-3 w-fit" onClick={submitAllergy} disabled={allergyGroup === "other" && !allergyText.trim()}>
          <Plus size={16} />
          {t("addAllergy")}
        </Button>
      </section>
    </div>
  );
}
