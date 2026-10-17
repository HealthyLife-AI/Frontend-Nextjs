"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ClipboardList, CopyPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { duplicateMealPlan, listMealPlans } from "@/lib/mealPlans/api";
import { useRouter } from "@/i18n/navigation";
import type { MealPlan } from "@/lib/mealPlans/types";

/**
 * Item C: what this patient is on right now — the target the
 * nutritionist approved against what the formula suggested, her summary,
 * and when it started — with the plans it replaced folded away beneath.
 *
 * Her decision, so it renders only on her own pages; the patient app
 * never receives these fields at all (MealPlanResource strips them).
 */
export function CurrentPlanCard({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("planDesigner.currentPlan");
  const tPrint = useTranslations("planPrint");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [plans, setPlans] = useState<MealPlan[] | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [duplicating, setDuplicating] = useState<number | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const result = await listMealPlans(authorizedFetch, subscriberId);
    if (result.ok) setPlans(result.data);
  }, [authorizedFetch, subscriberId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  /** Item E: opens the new draft straight away — it is what she edits next. */
  async function startFrom(planId: number) {
    setDuplicating(planId);
    const result = await duplicateMealPlan(authorizedFetch, subscriberId, planId);
    setDuplicating(null);
    if (result.ok) router.push(`/dashboard/patients/${subscriberId}/plan?planId=${result.data.id}`);
  }

  if (!plans) return null;

  const active = plans.find((p) => p.status === "active") ?? null;
  // Newest first, which is how she reads a case back.
  const previous = plans
    .filter((p) => p.status === "archived")
    .sort((a, b) => (b.activated_at ?? b.created_at).localeCompare(a.activated_at ?? a.created_at));

  if (!active && previous.length === 0) return null;

  const date = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(iso))
      : null;

  /** The summary's opening line is the gist; the rest belongs on the plan itself. */
  const firstLine = (summary: string | null | undefined) => (summary ?? "").split("\n")[0].trim();

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <ClipboardList size={18} className="text-primary" aria-hidden="true" />
        <h2 className="text-base font-bold text-ink">{t("title")}</h2>
      </div>

      {active ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {active.approved_calories ? (
              <span className="text-sm text-ink">
                <span className="text-xl font-bold tabular-nums text-primary">{active.approved_calories}</span>{" "}
                {t("approvedCalories")}
              </span>
            ) : (
              <span className="text-sm text-ink-muted">{t("noApprovedCalories")}</span>
            )}
            {active.suggested_calories != null && (
              <span className="text-xs text-ink-muted">{t("versusSuggestion", { value: active.suggested_calories })}</span>
            )}
            {date(active.activated_at) && <span className="text-xs text-ink-muted">{t("since", { date: date(active.activated_at)! })}</span>}
          </div>

          {active.plan_summary && <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{active.plan_summary}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/dashboard/patients/${subscriberId}/plan`} className="text-sm font-semibold text-primary hover:underline">
              {t("openPlan")}
            </Link>
            <button
              type="button"
              onClick={() => startFrom(active.id)}
              disabled={duplicating !== null}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-60"
            >
              <CopyPlus size={15} strokeWidth={2} aria-hidden="true" />
              {duplicating === active.id ? t("starting") : t("startFrom")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">{t("noActivePlan")}</p>
      )}

      {previous.length > 0 && (
        <div className="border-t border-divider pt-3">
          <button
            type="button"
            onClick={() => setShowPrevious((v) => !v)}
            aria-expanded={showPrevious}
            className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            {t("previous", { count: previous.length })}
            <ChevronDown size={16} className={`transition-transform ${showPrevious ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {showPrevious && (
            <ul className="mt-3 flex flex-col gap-2">
              {previous.map((plan) => (
                <li key={plan.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-field border border-border/70 p-3">
                  <div className="flex min-w-[8rem] flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink">
                      {date(plan.activated_at) ?? t("neverActivated")}
                      {plan.approved_calories ? ` · ${t("caloriesShort", { value: plan.approved_calories })}` : ""}
                    </span>
                    {firstLine(plan.plan_summary) && <span className="truncate text-xs text-ink-muted">{firstLine(plan.plan_summary)}</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/dashboard/patients/${subscriberId}/plan?planId=${plan.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t("view")}
                    </Link>
                    <Link
                      href={`/dashboard/patients/${subscriberId}/plan/print?planId=${plan.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {tPrint("print")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => startFrom(plan.id)}
                      disabled={duplicating !== null}
                      className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                    >
                      {duplicating === plan.id ? t("starting") : t("startFrom")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
