"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, Calculator, Printer, RotateCcw, ShieldAlert, Sparkles, Verified } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { getHealthProfile } from "@/lib/clients/api";
import { BmiSummary } from "@/components/clients/BmiSummary";
import { getProgress } from "@/lib/progress/api";
import type { CompositionSnapshot } from "@/lib/progress/types";
import { Link } from "@/i18n/navigation";
import { getHealthRecords } from "@/lib/healthRecords/api";
import {
  acknowledgeAllergens,
  activateMealPlan,
  createMealPlan,
  generateAiDraft,
  listMealPlans,
  saveMealPlanAsTemplate,
  suggestPlanSummary,
  updateMealPlan,
  updatePlanDecision,
} from "@/lib/mealPlans/api";
import type { AllergenRefusal } from "@/lib/mealPlans/api";
import { PlanDecisionCard } from "./PlanDecisionCard";
import { PatientInstructionsCard } from "./PatientInstructionsCard";
import { getPatientTips, type PatientTips } from "@/lib/conditions/api";
import type { CalorieSuggestion } from "@/lib/clients/types";
import type { AllergenConflict, MealPlan } from "@/lib/mealPlans/types";
import { AllergenChecksProvider, useAllergenChecks } from "./AllergenChecks";
import { AllergenConfirmDialog, MedicationNotice, type DialogConflict } from "./AllergenDialog";
import { DailySummaryPanel } from "./DailySummaryPanel";
import { MealCard } from "./MealCard";
import { emptySlots, foodName, planToSlots, slotsToInput, type EditableMeal } from "./mealSlots";

/**
 * S3-09/S3-11: the plan designer — orchestrates loading the client's
 * current plan (if any), editing it locally, and the save / activate /
 * AI-draft / save-as-template actions. Local edits are never persisted
 * until an explicit save (PRD F-4: a plan is edited as one whole form,
 * matching `HealthProfileForm`'s convention) — there's no per-keystroke
 * autosave to fight the backend's full-replace `PUT` semantics.
 *
 * `planId` pins which plan to open. Without it this picks the active
 * plan, which is wrong right after a template is applied: that creates a
 * new DRAFT, and a client who already had an active plan would land back
 * on the active one — showing something other than what the nutritionist
 * just created.
 */
export function PlanDesigner({ subscriberId, planId }: { subscriberId: string; planId?: string }) {
  // One allergen-check cache for the whole designer (rows, alternatives and
  // the food search all read and fill it).
  return (
    <AllergenChecksProvider subscriberId={subscriberId}>
      <PlanDesignerInner subscriberId={subscriberId} planId={planId} />
    </AllergenChecksProvider>
  );
}

function PlanDesignerInner({ subscriberId, planId }: { subscriberId: string; planId?: string }) {
  const t = useTranslations("planDesigner");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const tAllergen = useTranslations("allergenDialog");
  const tNutrition = useTranslations("nutritionWarning");
  const locale = useLocale();
  const { checks, request: requestChecks } = useAllergenChecks();
  const tPrint = useTranslations("planPrint");
  const tBmi = useTranslations("clients.bmi");
  const { authorizedFetch } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [slots, setSlots] = useState<EditableMeal[]>(emptySlots());
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  // Item C: her decision. `suggestion` is the formula's figure, shown
  // beside the field; `approvedCalories` is what she prescribed.
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [gender, setGender] = useState<"female" | "male" | null>(null);
  // From the API (config/nutrition.php); null until the profile loads.
  const [calorieFloor, setCalorieFloor] = useState<Record<"female" | "male", number> | null>(null);
  const [approvedCalories, setApprovedCalories] = useState("");
  const [planSummary, setPlanSummary] = useState("");
  // Clinical batch 1: text for the patient (visible in the app and on the printout), the tips offered for it, and how the suggestion was reached.
  const [patientInstructions, setPatientInstructions] = useState("");
  const [tips, setTips] = useState<PatientTips | null>(null);
  const [breakdown, setBreakdown] = useState<CalorieSuggestion | null>(null);
  // Item B: the BMI line shown while she writes the plan.
  const [profileBody, setProfileBody] = useState<{ height_cm: number; age: number; weight_kg: number } | null>(null);
  const [latestReading, setLatestReading] = useState<CompositionSnapshot | null>(null);
  const [dirty, setDirty] = useState(false);
  // Meal edits specifically: the print sheet carries the typed decision, but meals come from the saved plan.
  const [mealsDirty, setMealsDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);
  const [suggestingSummary, setSuggestingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // A patient-proposed allergy is not used by the draft (or anywhere) until approved.
  const [pendingAllergy, setPendingAllergy] = useState(false);
  // Pilot feedback 2, C1: the patient's current medications, names only.
  const [medicationNames, setMedicationNames] = useState<string[]>([]);
  // Pilot feedback 2, A5: the activation / acknowledgement dialog. A fresh `key`
  // per open remounts it, so its tick never carries over from a previous one.
  const [allergenDialog, setAllergenDialog] = useState<{ key: number; mode: "activate" | "acknowledge"; conflicts: DialogConflict[] } | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [plansResult, profileResult, recordsResult, progressResult] = await Promise.all([
        listMealPlans(authorizedFetch, subscriberId),
        getHealthProfile(authorizedFetch, subscriberId),
        getHealthRecords(authorizedFetch, subscriberId),
        getProgress(authorizedFetch, subscriberId),
      ]);

      if (cancelled) return;

      if (progressResult.ok) setLatestReading(progressResult.data.body_composition.latest);

      if (recordsResult.ok) {
        setPendingAllergy(recordsResult.data.proposals.some((p) => p.kind === "allergy"));
        setMedicationNames(recordsResult.data.medications.map((m) => m.name).filter(Boolean));
      }

      const tipsResult = await getPatientTips(authorizedFetch, subscriberId);
      if (tipsResult.ok) setTips(tipsResult.data);

      // Clinical batch 1, B: the system's suggestion is the goal-adjusted
      // figure (maintenance minus the clinic's deficit), not bare maintenance.
      const detail = profileResult.ok && profileResult.data ? (profileResult.data.calorie_suggestion ?? null) : null;
      const formula =
        profileResult.ok && profileResult.data ? (detail?.suggested ?? profileResult.data.daily_calorie_needs) : null;
      if (profileResult.ok && profileResult.data) {
        setBreakdown(detail);
        setSuggestion(formula);
        setGender(profileResult.data.gender);
        setCalorieFloor(profileResult.data.calorie_floor ?? null);
        setCalorieTarget(profileResult.data.daily_calorie_needs);
        setProfileBody({
          height_cm: profileResult.data.height_cm,
          age: profileResult.data.age,
          weight_kg: profileResult.data.weight_kg,
        });
      }

      // Item C: mirrors CalorieTarget::effective() on the server — the
      // ACTIVE plan's approved figure if she set one, else the formula.
      // Computed from data already loaded, so there is no extra call.
      const effective =
        (plansResult.ok ? plansResult.data.find((p) => p.status === "active")?.approved_calories : null) ?? formula;
      setCalorieTarget(effective ?? null);

      if (plansResult.ok && plansResult.data.length > 0) {
        // An explicitly requested plan wins over both (see the prop's
        // note); otherwise the active plan if one exists, otherwise the
        // most recently touched draft — never an archived one, there's
        // nothing to keep editing there.
        const relevant =
          (planId ? plansResult.data.find((p) => String(p.id) === planId) : undefined) ??
          plansResult.data.find((p) => p.status === "active") ??
          plansResult.data.filter((p) => p.status === "draft").sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ??
          null;

        if (relevant) {
          setCurrentPlan(relevant);
          setSlots(planToSlots(relevant));
          // A draft with no figure of its own starts from the effective
          // target (she may overwrite it); the ACTIVE plan is shown as
          // stored, so an empty field there honestly means "uses the
          // system suggestion".
          setApprovedCalories(
            relevant.approved_calories
              ? String(relevant.approved_calories)
              : relevant.status === "draft" && effective
                ? String(effective)
                : ""
          );
          setPlanSummary(relevant.plan_summary ?? "");
          setPatientInstructions(relevant.patient_instructions ?? "");
        }
      } else if (effective) {
        // A brand-new plan: pre-filled with the effective target.
        setApprovedCalories(String(effective));
      }

      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId, planId]);

  // Every food on screen (planned and alternative, saved or just picked) is
  // checked by the server, so the warning appears before the save.
  useEffect(() => {
    const ids = slots.flatMap((slot) => slot.items.flatMap((item) => [item.food.id, ...item.alternatives.map((a) => a.food.id)]));
    if (ids.length > 0) void requestChecks(ids);
  }, [slots, requestChecks]);

  function updateSlot(index: number, next: EditableMeal) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? next : slot)));
    setDirty(true);
    setMealsDirty(true);
    setNotice(null);
  }

  /**
   * Item C: on the ACTIVE plan the decision is saved on its own, through
   * the narrow endpoint — the meals are already in force and the patient
   * is following them, so a decision edit must not touch them.
   */
  async function handleSaveDecision() {
    if (!currentPlan) return;

    setError(null);
    setSavingDecision(true);
    const result = await updatePlanDecision(authorizedFetch, subscriberId, currentPlan.id, {
      approved_calories: approvedCalories ? Number(approvedCalories) : null,
      plan_summary: planSummary.trim() || null,
      patient_instructions: patientInstructions.trim() || null,
    });
    setSavingDecision(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setCurrentPlan(result.data);
    setNotice(t("decision.saved"));
  }

  /**
   * Item D: fills both fields without saving — she reads it, edits it,
   * then saves with the normal button. Replacing text she already wrote
   * is confirmed first.
   */
  async function handleSuggestSummary() {
    if (!currentPlan) return;
    if ((planSummary.trim() || approvedCalories) && !window.confirm(t("decision.confirmReplace"))) return;

    setError(null);
    setSuggestingSummary(true);
    const result = await suggestPlanSummary(authorizedFetch, subscriberId, currentPlan.id);
    setSuggestingSummary(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setPlanSummary(result.data.suggested_summary);
    if (result.data.suggested_approved_calories !== null) {
      setApprovedCalories(String(result.data.suggested_approved_calories));
    }
    setDirty(true);
    setNotice(result.data.is_fallback ? t("decision.suggestionFallback") : t("decision.suggestionReady"));
  }

  /**
   * The print sheet reads the plan from the server, so a summary or target
   * typed but not yet saved would silently be missing from it. Hand the
   * on-screen values over for the next few minutes instead: nothing is
   * written, and the patient is not notified of anything.
   *
   * Meal edits are different — they are the plan itself, and the sheet
   * prints the saved meals — so unsaved ones are confirmed first.
   */
  function rememberForPrint(event: React.MouseEvent) {
    if (!currentPlan) return;

    if (mealsDirty && !window.confirm(tPrint("unsavedMeals"))) {
      event.preventDefault();
      return;
    }

    try {
      sessionStorage.setItem(
        `planPrintDraft:${currentPlan.id}`,
        JSON.stringify({
          at: Date.now(),
          approved_calories: approvedCalories ? Number(approvedCalories) : null,
          plan_summary: planSummary.trim() || null,
          patient_instructions: patientInstructions.trim() || null,
        })
      );
    } catch {
      // Storage blocked: the sheet just prints what is saved.
    }
  }

  async function handleSave(): Promise<MealPlan | null> {
    setError(null);
    setSaving(true);

    const payload = {
      meals: slotsToInput(slots),
      // Cleared on purpose means "fall back to the system suggestion",
      // so an empty field is sent as null rather than omitted.
      approved_calories: approvedCalories ? Number(approvedCalories) : null,
      plan_summary: planSummary.trim() || null,
      patient_instructions: patientInstructions.trim() || null,
    };
    const result = currentPlan
      ? await updateMealPlan(authorizedFetch, subscriberId, currentPlan.id, payload)
      : await createMealPlan(authorizedFetch, subscriberId, payload);

    setSaving(false);

    if (!result.ok) {
      setError(result.error.message);
      return null;
    }

    setCurrentPlan(result.data);
    setDirty(false);
    setMealsDirty(false);
    setNotice(t("saved"));
    return result.data;
  }

  /** The conflicts the designer can already see, for the dialog: from the server's checks of each food on screen. */
  function localConflicts(): DialogConflict[] {
    return slots.flatMap((slot) =>
      slot.items.flatMap((item) =>
        [{ food: item.food, alt: false }, ...item.alternatives.map((a) => ({ food: a.food, alt: true }))].flatMap(({ food, alt }) => {
          const conflict = checks[food.id]?.conflict;
          return conflict
            ? [{ key: `${slot.slotKey}-${food.id}-${alt}`, foodName: foodName(food, locale), mealLabel: tSlots(slot.slotKey), groups: conflict.groups, severity: conflict.severity, isAlternative: alt }]
            : [];
        })
      )
    );
  }

  /** The same list from a plan report or a refused activation, for when the on-screen checks missed it. */
  function fromServer(conflicts: AllergenConflict[]): DialogConflict[] {
    return conflicts.map((c) => ({
      key: `${c.item_id}`,
      foodName: c.food_name_ar ?? "",
      mealLabel: tAllergen(`meal.${c.meal_name}`),
      groups: c.groups,
      severity: c.severity,
      isAlternative: c.parent_item_id !== null,
    }));
  }

  /**
   * The approve-and-activate button. Plans with nothing to review activate
   * as before. With a food that conflicts with an allergy, or a patient on
   * medication, a dialog comes first: a confirmed allergy needs the explicit
   * tick, the rest is shown so it is not missed.
   */
  function handleActivateClick() {
    const conflicts = localConflicts();

    if (conflicts.length > 0 || medicationNames.length > 0) {
      setAllergenDialog({ key: Date.now(), mode: "activate", conflicts });
      return;
    }

    void handleActivate(false);
  }

  async function handleActivate(acknowledge: boolean) {
    setError(null);
    const plan = dirty || !currentPlan ? await handleSave() : currentPlan;
    if (!plan) return;

    setActivating(true);
    const result = await activateMealPlan(authorizedFetch, subscriberId, plan.id, acknowledge);
    setActivating(false);

    if (!result.ok) {
      // The server's word is final: a confirmed conflict the on-screen checks
      // missed (a check not back yet, say) is refused with the list to show.
      const refusal = result.error as unknown as AllergenRefusal;
      if (result.status === 422 && refusal.code === "allergen_conflict_unacknowledged") {
        setAllergenDialog({ key: Date.now(), mode: "activate", conflicts: fromServer(refusal.allergen_conflicts ?? []) });
        return;
      }

      setError(result.error.message);
      return;
    }

    setAllergenDialog(null);
    setCurrentPlan(result.data);
    setNotice(t("activated"));
  }

  /** Records that she reviewed the conflicts on the plan already in force. No re-activation, no notification. */
  async function handleAcknowledge() {
    if (!currentPlan) return;

    setError(null);
    setAcknowledging(true);
    const result = await acknowledgeAllergens(authorizedFetch, subscriberId, currentPlan.id);
    setAcknowledging(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAllergenDialog(null);
    setCurrentPlan(result.data);
    setNotice(t("allergenAcknowledged"));
  }

  async function handleGenerateDraft() {
    if (dirty && !window.confirm(t("confirmDiscardForDraft"))) return;

    setError(null);
    setGeneratingDraft(true);
    const result = await generateAiDraft(authorizedFetch, subscriberId, approvedCalories ? Number(approvedCalories) : null);
    setGeneratingDraft(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setCurrentPlan(result.data);
    setSlots(planToSlots(result.data));
    setApprovedCalories(result.data.approved_calories ? String(result.data.approved_calories) : approvedCalories);
    setDirty(false);
    setMealsDirty(false);
    setNotice(null);
    if (result.data.warnings?.includes("pending_allergy_proposal")) setPendingAllergy(true);
  }

  async function handleSaveAsTemplate() {
    if (!currentPlan) return;

    // A cancelled prompt (null) means "changed my mind" — abort rather
    // than saving unnamed. An empty string means "skip the name on
    // purpose", which the API already accepts.
    const name = window.prompt(t("templateNamePrompt"), "");
    if (name === null) return;

    setError(null);
    setSavingTemplate(true);
    const result = await saveMealPlanAsTemplate(authorizedFetch, subscriberId, currentPlan.id, name);
    setSavingTemplate(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setNotice(t("templateSaved"));
  }

  if (!loaded) {
    return <div className="py-16 text-center text-sm text-ink-muted">…</div>;
  }

  const isActive = currentPlan?.status === "active";
  const hasSavedPlan = Boolean(currentPlan);

  return (
    <div className="flex flex-col gap-5">
      {pendingAllergy && (
        <p role="alert" className="flex flex-wrap items-center gap-2 rounded-field border border-status-attention/30 bg-status-attention-bg px-3.5 py-2.5 text-sm text-ink">
          <ShieldAlert size={17} className="shrink-0 text-status-attention" aria-hidden="true" />
          {t("pendingAllergyBanner")}
          <Link href={`/dashboard/patients/${subscriberId}`} className="font-semibold text-mkt-teal-deep hover:underline">
            {t("pendingAllergyReview")}
          </Link>
        </p>
      )}

      <MedicationNotice names={medicationNames} />

      {/* Pilot feedback 2, A3: the ACTIVE plan holds a confirmed-allergy conflict its acknowledgement does not cover. */}
      {currentPlan?.new_unacknowledged_conflicts && (
        <div role="alert" className="flex flex-col gap-3 rounded-field border border-status-late/30 bg-status-late-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm font-medium text-status-late">
            <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            {tAllergen("newConflictBanner")}
          </p>
          <Button
            variant="secondary"
            onClick={() => setAllergenDialog({ key: Date.now(), mode: "acknowledge", conflicts: fromServer((currentPlan.allergen_conflicts ?? []).filter((c) => c.severity === "confirmed_allergy")) })}
            className="shrink-0"
          >
            {tAllergen("review")}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(latestReading?.bmi ?? profileBody) && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas/60 px-3 py-1 text-xs">
              <span className="font-semibold text-ink-muted">{tBmi("label")}</span>
              <BmiSummary
                enteredBmi={latestReading?.bmi}
                recordedAt={latestReading?.recorded_at ?? null}
                weightKg={latestReading?.weight_kg ?? profileBody?.weight_kg ?? null}
                heightCm={profileBody?.height_cm ?? null}
                age={profileBody?.age ?? null}
              />
            </span>
          )}
          {currentPlan && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive ? "bg-status-on-track-bg text-status-on-track" : "bg-ink-muted/10 text-ink-muted"
              }`}
            >
              {isActive ? t("statusActive") : t("statusDraft")}
            </span>
          )}
          {/* Only a draft the model actually produced is called "smart"; the rule-based fallback gets a neutral tag. */}
          {currentPlan?.is_ai_draft && !currentPlan.is_ai_fallback && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles size={14} />
              {t("aiDraftTag")}
            </span>
          )}
          {currentPlan?.is_ai_draft && currentPlan.is_ai_fallback && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-ink-muted/10 px-2.5 py-1 text-xs font-medium text-ink-muted">
              <Calculator size={14} />
              {t("fallbackDraftTag")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" isLoading={generatingDraft} onClick={handleGenerateDraft} title={t("aiDraftHint")}>
            <Sparkles size={16} strokeWidth={1.75} />
            {t("suggestPlan")}
          </Button>
          {currentPlan && (
            <Link
              href={`/dashboard/patients/${subscriberId}/plan/print?planId=${currentPlan.id}`}
              onClick={rememberForPrint}
              className="inline-flex h-11 items-center gap-2 rounded-field px-5 text-sm font-semibold text-ink-muted transition-colors hover:bg-ink-muted/[0.08] hover:text-ink"
            >
              <Printer size={16} strokeWidth={1.75} />
              {tPrint("print")}
            </Link>
          )}
          <Button variant="ghost" isLoading={savingTemplate} disabled={!hasSavedPlan} onClick={handleSaveAsTemplate}>
            <Bookmark size={16} strokeWidth={1.75} />
            {t("saveAsTemplate")}
          </Button>
          <Button variant="secondary" isLoading={saving} onClick={handleSave}>
            {t("savePlan")}
          </Button>
          <Button isLoading={activating} disabled={isActive} onClick={handleActivateClick}>
            <Verified size={16} strokeWidth={1.75} />
            {isActive ? t("statusActive") : t("approveAndActivate")}
          </Button>
        </div>
      </div>

      {currentPlan?.is_ai_draft && currentPlan.is_ai_fallback && (
        <div role="note" className="flex flex-col gap-3 rounded-field border border-status-attention/25 bg-status-attention-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-ink">{t("fallbackDraftNote")}</p>
          <Button variant="secondary" isLoading={generatingDraft} onClick={handleGenerateDraft} className="shrink-0">
            <RotateCcw size={16} strokeWidth={1.75} />
            {t("fallbackRetry")}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-field bg-status-on-track-bg px-3.5 py-2.5 text-sm text-status-on-track">
          {notice}
        </p>
      )}

      <PlanDecisionCard
        approvedCalories={approvedCalories}
        onApprovedCaloriesChange={(v) => {
          setApprovedCalories(v);
          setDirty(true);
        }}
        summary={planSummary}
        onSummaryChange={(v) => {
          setPlanSummary(v);
          setDirty(true);
        }}
        suggestion={suggestion}
        breakdown={breakdown}
        floor={gender && calorieFloor ? calorieFloor[gender] : null}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" isLoading={suggestingSummary} disabled={!hasSavedPlan} onClick={handleSuggestSummary}>
            <Sparkles size={16} strokeWidth={1.75} />
            {t("decision.suggest")}
          </Button>
          {isActive && (
            <Button variant="secondary" isLoading={savingDecision} onClick={handleSaveDecision}>
              {t("decision.save")}
            </Button>
          )}
        </div>
      </PlanDecisionCard>

      <PatientInstructionsCard
        value={patientInstructions}
        onChange={(v) => {
          setPatientInstructions(v);
          setDirty(true);
        }}
        tips={tips}
        onSave={isActive ? handleSaveDecision : undefined}
        saving={savingDecision}
      />

      {/* Clinical batch 1, E4: glycemic load / sodium of the SAVED plan, reviewed foods only. */}
      {(currentPlan?.nutrition_warnings ?? []).length > 0 && (
        <div role="note" className="flex flex-col gap-1.5 rounded-field border border-status-attention/25 bg-status-attention-bg px-4 py-3">
          <p className="text-sm font-semibold text-status-attention">{tNutrition("title")}</p>
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {(currentPlan?.nutrition_warnings ?? []).map((w) => (
              <li key={`${w.item_id}-${w.type}`}>
                <span className="font-semibold">{w.food_name_ar}</span>
                {" — "}
                {w.type === "sodium"
                  ? tNutrition("sodium", { value: w.sodium_mg_per_100g ?? 0 })
                  : w.type === "gl"
                    ? tNutrition("glOnly", { gi: w.gi ?? 0, gl: w.gl ?? 0 })
                    : w.type === "gi"
                      ? tNutrition("gi", { gi: w.gi ?? 0 })
                      : tNutrition("giGl", { gi: w.gi ?? 0, gl: w.gl ?? 0 })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          {slots.map((slot, index) => (
            <MealCard key={slot.slotKey} meal={slot} onChange={(next) => updateSlot(index, next)} />
          ))}
        </div>

        <div className="lg:col-span-4">
          <DailySummaryPanel meals={slots} calorieTarget={approvedCalories ? Number(approvedCalories) : calorieTarget} />
        </div>
      </div>

      {allergenDialog && (
        <AllergenConfirmDialog
          key={allergenDialog.key}
          open
          mode={allergenDialog.mode}
          conflicts={allergenDialog.conflicts}
          medications={allergenDialog.mode === "activate" ? medicationNames : []}
          busy={activating || acknowledging}
          onCancel={() => setAllergenDialog(null)}
          onConfirm={() => (allergenDialog.mode === "acknowledge" ? void handleAcknowledge() : void handleActivate(allergenDialog.conflicts.some((c) => c.severity === "confirmed_allergy")))}
        />
      )}
    </div>
  );
}
