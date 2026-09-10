"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, Sparkles, Verified } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { getHealthProfile } from "@/lib/clients/api";
import {
  activateMealPlan,
  createMealPlan,
  generateAiDraft,
  listMealPlans,
  saveMealPlanAsTemplate,
  updateMealPlan,
} from "@/lib/mealPlans/api";
import type { MealPlan } from "@/lib/mealPlans/types";
import { DailySummaryPanel } from "./DailySummaryPanel";
import { MealCard } from "./MealCard";
import { emptySlots, planToSlots, slotsToInput, type EditableMeal } from "./mealSlots";

/**
 * S3-09/S3-11: the plan designer — orchestrates loading the client's
 * current plan (if any), editing it locally, and the save / activate /
 * AI-draft / save-as-template actions. Local edits are never persisted
 * until an explicit save (PRD F-4: a plan is edited as one whole form,
 * matching `HealthProfileForm`'s convention) — there's no per-keystroke
 * autosave to fight the backend's full-replace `PUT` semantics.
 */
export function PlanDesigner({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("planDesigner");
  const { authorizedFetch } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [slots, setSlots] = useState<EditableMeal[]>(emptySlots());
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [plansResult, profileResult] = await Promise.all([
        listMealPlans(authorizedFetch, subscriberId),
        getHealthProfile(authorizedFetch, subscriberId),
      ]);

      if (cancelled) return;

      if (profileResult.ok && profileResult.data) {
        setCalorieTarget(profileResult.data.daily_calorie_needs);
      }

      if (plansResult.ok && plansResult.data.length > 0) {
        // The active plan if one exists, otherwise the most recently
        // touched draft — never an archived one, there's nothing to
        // keep editing there.
        const relevant =
          plansResult.data.find((p) => p.status === "active") ??
          plansResult.data.filter((p) => p.status === "draft").sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ??
          null;

        if (relevant) {
          setCurrentPlan(relevant);
          setSlots(planToSlots(relevant));
        }
      }

      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  function updateSlot(index: number, next: EditableMeal) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? next : slot)));
    setDirty(true);
    setNotice(null);
  }

  async function handleSave(): Promise<MealPlan | null> {
    setError(null);
    setSaving(true);

    const payload = { meals: slotsToInput(slots) };
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
    setNotice(t("saved"));
    return result.data;
  }

  async function handleActivate() {
    setError(null);
    const plan = dirty || !currentPlan ? await handleSave() : currentPlan;
    if (!plan) return;

    setActivating(true);
    const result = await activateMealPlan(authorizedFetch, subscriberId, plan.id);
    setActivating(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setCurrentPlan(result.data);
    setNotice(t("activated"));
  }

  async function handleGenerateDraft() {
    if (dirty && !window.confirm(t("confirmDiscardForDraft"))) return;

    setError(null);
    setGeneratingDraft(true);
    const result = await generateAiDraft(authorizedFetch, subscriberId);
    setGeneratingDraft(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setCurrentPlan(result.data);
    setSlots(planToSlots(result.data));
    setDirty(false);
    setNotice(null);
  }

  async function handleSaveAsTemplate() {
    if (!currentPlan) return;

    setError(null);
    setSavingTemplate(true);
    const result = await saveMealPlanAsTemplate(authorizedFetch, subscriberId, currentPlan.id);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {currentPlan && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive ? "bg-status-on-track-bg text-status-on-track" : "bg-ink-muted/10 text-ink-muted"
              }`}
            >
              {isActive ? t("statusActive") : t("statusDraft")}
            </span>
          )}
          {currentPlan?.is_ai_draft && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles size={14} />
              {t("aiDraftTag")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" isLoading={generatingDraft} onClick={handleGenerateDraft} title={t("aiDraftHint")}>
            <Sparkles size={16} strokeWidth={1.75} />
            {t("suggestPlan")}
          </Button>
          <Button variant="ghost" isLoading={savingTemplate} disabled={!hasSavedPlan} onClick={handleSaveAsTemplate}>
            <Bookmark size={16} strokeWidth={1.75} />
            {t("saveAsTemplate")}
          </Button>
          <Button variant="secondary" isLoading={saving} onClick={handleSave}>
            {t("savePlan")}
          </Button>
          <Button isLoading={activating} disabled={isActive} onClick={handleActivate}>
            <Verified size={16} strokeWidth={1.75} />
            {isActive ? t("statusActive") : t("approveAndActivate")}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-control bg-status-on-track-bg px-3.5 py-2.5 text-sm text-status-on-track">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          {slots.map((slot, index) => (
            <MealCard key={slot.slotKey} meal={slot} onChange={(next) => updateSlot(index, next)} />
          ))}
        </div>

        <div className="lg:col-span-4">
          <DailySummaryPanel meals={slots} calorieTarget={calorieTarget} />
        </div>
      </div>
    </div>
  );
}
