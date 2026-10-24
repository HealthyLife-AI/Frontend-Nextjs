"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Printer } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { getClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { listMealPlans } from "@/lib/mealPlans/api";
import type { MealPlan, PlanActivityInput } from "@/lib/mealPlans/types";
import { displayCalories, displayGrams, foodName, itemMacros, mealMacros, planMacros, planToSlots } from "@/components/mealPlans/mealSlots";

/**
 * Item F: a printable copy of one plan — the browser's own print dialog
 * ("Save as PDF" included), with no server-side renderer and nothing
 * stored anywhere.
 *
 * The private box (her approved target and summary) is ON by default
 * because this is her working copy; when it is included the header says
 * so in as many words, so a sheet left on a desk cannot be mistaken for
 * the patient's handout. Turning it off produces the patient's version.
 */
export default function PlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const planId = useSearchParams().get("planId");
  const t = useTranslations("planPrint");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const tPlan = useTranslations("planDesigner");
  const locale = useLocale();
  const { authorizedFetch, user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [includePrivate, setIncludePrivate] = useState(true);
  // The designer's typed-but-unsaved decision, handed over for a few minutes (see PlanDesigner).
  const [unsaved, setUnsaved] = useState<{ approved_calories: number | null; plan_summary: string | null; patient_instructions: string | null; activities: PlanActivityInput[] | null } | null>(null);

  const load = useCallback(async () => {
    const [clientResult, plansResult] = await Promise.all([
      getClient(authorizedFetch, id),
      listMealPlans(authorizedFetch, id),
    ]);

    if (clientResult.ok) setClient(clientResult.data);

    if (!plansResult.ok) {
      setNotFound(true);
      return;
    }

    const chosen =
      (planId ? plansResult.data.find((p) => String(p.id) === planId) : undefined) ??
      plansResult.data.find((p) => p.status === "active") ??
      null;

    if (chosen) {
      setPlan(chosen);
      try {
        const raw = sessionStorage.getItem(`planPrintDraft:${chosen.id}`);
        const draft = raw ? JSON.parse(raw) : null;
        // Only a recent hand-off: an old one would print a decision since changed elsewhere.
        if (draft && Date.now() - draft.at < 10 * 60 * 1000) {
          setUnsaved({
            approved_calories: draft.approved_calories ?? null,
            plan_summary: draft.plan_summary ?? null,
            patient_instructions: draft.patient_instructions ?? null,
            activities: Array.isArray(draft.activities) ? draft.activities : null,
          });
        }
      } catch {
        // Unreadable: print what is saved.
      }
    } else setNotFound(true);
  }, [authorizedFetch, id, planId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (notFound) return <p className="py-16 text-center text-sm text-ink-muted">{t("noPlan")}</p>;
  if (!plan) return <p className="py-16 text-center text-sm text-ink-muted">…</p>;

  // What the sheet shows for the decision: the typed values if handed over, else the saved ones.
  const approvedCalories = unsaved ? unsaved.approved_calories : plan.approved_calories;
  const planSummary = unsaved ? unsaved.plan_summary : plan.plan_summary;
  // Written for the patient, so it prints whatever the private box is set to.
  const patientInstructions = unsaved ? unsaved.patient_instructions : plan.patient_instructions;
  // Phase 1, A3: prescribed activity, printed after the meals (it is for the patient).
  const activities = (unsaved?.activities ?? plan.activities ?? []) as PlanActivityInput[];
  const slots = planToSlots(plan).filter((slot) => slot.items.length > 0);
  const totals = planMacros(slots);
  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 print:max-w-none print:gap-0">
      {/* Screen-only controls; `print:hidden` keeps them off the sheet. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border/70 bg-card p-4 shadow-panel print:hidden">
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={includePrivate}
            onChange={(e) => setIncludePrivate(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("includePrivate")}
        </label>
        {unsaved && <p className="basis-full text-xs text-ink-muted">{t("unsavedNote")}</p>}
        <Button onClick={() => window.print()}>
          <Printer size={16} strokeWidth={1.75} />
          {t("print")}
        </Button>
      </div>

      <article className="flex flex-col gap-5 rounded-panel border border-border/70 bg-card p-6 shadow-panel print:gap-4 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-3 border-b border-divider pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Image src="/home/logo.png" alt="" width={144} height={72} className="h-auto w-28" />
            <div className="text-end text-xs text-ink-muted">
              <div className="font-semibold text-ink">{user?.name}</div>
              <div>{t("printedOn", { date: dateFmt.format(new Date()) })}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="text-xl font-extrabold text-ink">{client?.name}</h1>
            {client?.code && <span className="text-sm text-ink-muted" dir="ltr">{client.code}</span>}
            <span className="text-sm text-ink-muted">{tPlan(plan.status === "active" ? "statusActive" : "statusDraft")}</span>
            {plan.activated_at && <span className="text-sm text-ink-muted">{t("activatedOn", { date: dateFmt.format(new Date(plan.activated_at)) })}</span>}
          </div>

          {includePrivate && <p className="text-sm font-bold text-status-attention">{t("nutritionistCopy")}</p>}
        </header>

        {includePrivate && (approvedCalories || planSummary) && (
          <section className="flex flex-col gap-2 rounded-field border border-border p-4 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-ink">{tPlan("decision.title")}</h2>
            {approvedCalories && (
              <p className="text-sm text-ink">
                {tPlan("decision.approvedCalories")}: <span className="font-bold tabular-nums">{approvedCalories}</span>
                {plan.suggested_calories != null && (
                  <span className="text-ink-muted"> · {tPlan("currentPlan.versusSuggestion", { value: plan.suggested_calories })}</span>
                )}
              </p>
            )}
            {planSummary && <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{planSummary}</p>}
          </section>
        )}

        {patientInstructions && patientInstructions.trim() !== "" && (
          <section className="flex flex-col gap-2 rounded-field border border-border p-4 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-ink">{t("patientInstructions")}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{patientInstructions}</p>
          </section>
        )}

        {slots.map((slot) => {
          const macros = mealMacros(slot);
          return (
            <section key={slot.slotKey} className="flex flex-col gap-2 print:break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2 border-b border-divider pb-1">
                <h2 className="text-base font-bold text-ink">{tSlots(slot.slotKey)}</h2>
                <span className="text-sm font-semibold tabular-nums text-ink-muted">
                  {tPlan("caloriesValue", { value: displayCalories(macros.calories) })}
                </span>
              </div>

              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="text-xs text-ink-muted">
                    <th className="py-1 text-start font-semibold">{t("columnFood")}</th>
                    <th className="w-24 py-1 text-start font-semibold">{t("columnQuantity")}</th>
                    <th className="w-24 py-1 text-end font-semibold">{t("columnCalories")}</th>
                  </tr>
                </thead>
                <tbody>
                  {slot.items.map((item, index) => (
                    <tr key={item.id ?? index} className="align-top">
                      <td className="border-t border-divider py-1.5">
                        <div className="font-medium text-ink">{foodName(item.food, locale)}</div>
                        {item.alternatives.map((alt, altIndex) => (
                          <div key={alt.id ?? `${index}-${altIndex}`} className="ps-4 text-xs text-ink-muted">
                            {t("alternative")}: {foodName(alt.food, locale)} — {tPlan("quantityGrams", { value: displayGrams(alt.quantityGrams) })} —{" "}
                            {tPlan("caloriesValue", { value: displayCalories(itemMacros(alt).calories) })}
                          </div>
                        ))}
                      </td>
                      <td className="border-t border-divider py-1.5 tabular-nums text-ink">{displayGrams(item.quantityGrams)}</td>
                      <td className="border-t border-divider py-1.5 text-end tabular-nums text-ink">
                        {displayCalories(itemMacros(item).calories)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        <section className="flex flex-wrap gap-x-6 gap-y-1 border-t border-divider pt-3 text-sm print:break-inside-avoid">
          <span className="font-bold text-ink">{t("dailyTotal")}</span>
          <span className="tabular-nums text-ink">{tPlan("caloriesValue", { value: displayCalories(totals.calories) })}</span>
          <span className="tabular-nums text-ink-muted">
            {tPlan("summary.protein")} {displayGrams(totals.protein_g)} · {tPlan("summary.carbs")} {displayGrams(totals.carbs_g)} ·{" "}
            {tPlan("summary.fat")} {displayGrams(totals.fat_g)}
          </span>
        </section>

        {activities.length > 0 && (
          <section className="flex flex-col gap-2 print:break-inside-avoid">
            <h2 className="border-b border-divider pb-1 text-base font-bold text-ink">{t("activities")}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {activities.map((a, index) => (
                <li key={index} className="flex flex-col gap-0.5">
                  <span className="font-semibold text-ink">{a.title}</span>
                  <span className="text-ink-muted">
                    {t("activityLine", { minutes: a.duration_minutes, times: a.times_per_day })}
                    {a.days_per_week ? ` · ${t("activityDays", { days: a.days_per_week })}` : ""}
                  </span>
                  {a.description && <span className="whitespace-pre-line text-ink">{a.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
