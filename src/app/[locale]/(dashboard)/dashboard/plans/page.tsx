"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { UtensilsCrossed, Flame, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PlanBreakdown, PlanMacroSummary } from "@/components/mealPlans/PlanBreakdown";
import { applyMealPlanTemplate, listMealPlanTemplates } from "@/lib/mealPlans/api";
import type { MealPlan } from "@/lib/mealPlans/types";
import { listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

/**
 * S3-03 / FR-15: the nutritionist's template library — the "Plans" nav
 * item, which has linked here since Sprint 1 with no page behind it.
 *
 * Deliberately NOT a roster-wide list of every client's plan: plans are
 * fetched per subscriber (`/clients/{id}/meal-plans`) and no endpoint
 * returns them across the roster, so such a screen would need either a
 * new endpoint or one request per client. What IS reusable across
 * clients — and what this nav item means — is the template library.
 *
 * Applying a template creates a DRAFT (BR-6/BR-10), so this navigates
 * straight to that client's plan designer rather than implying the
 * client can already see it.
 */
export default function PlansPage() {
  const t = useTranslations("plans");
  const { authorizedFetch } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<MealPlan[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listMealPlanTemplates(authorizedFetch).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setTemplates(result.data);
      } else {
        setLoadFailed(true);
        setTemplates([]);
      }
    });

    // Only active clients can meaningfully receive a plan — a pending
    // one hasn't accepted their invite yet, so they have no app to see
    // it in.
    listClients(authorizedFetch, { status: "active" }).then((result) => {
      if (!cancelled && result.ok) setClients(result.data.data);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {loadFailed && (
        <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {templates === null && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {templates?.length === 0 && !loadFailed && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card py-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UtensilsCrossed size={22} strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-ink">{t("empty")}</p>
          <p className="max-w-sm text-xs text-ink-muted">{t("emptyHint")}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {templates?.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            clients={clients}
            onApplied={(subscriberId, planId) =>
              router.push(`/dashboard/patients/${subscriberId}/plan?planId=${planId}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  clients,
  onApplied,
}: {
  template: MealPlan;
  clients: Client[];
  onApplied: (subscriberId: number, planId: number) => void;
}) {
  const t = useTranslations("plans");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const { authorizedFetch } = useAuth();

  const [subscriberId, setSubscriberId] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Collapsed by default so a library of a dozen templates stays
  // scannable; the macro split above is what narrows the choice, the
  // food list is what confirms it.
  const [expanded, setExpanded] = useState(false);

  // A template carries no day-specific meals in the common case, so its
  // whole daily total sits under key "0" — sum whatever keys exist
  // rather than assuming that one.
  const dailyCalories = Math.round(
    Object.values(template.summary_by_day).reduce((total, day) => total + day.calories, 0) /
      Math.max(Object.keys(template.summary_by_day).length, 1)
  );

  async function handleApply() {
    if (!subscriberId) return;

    setApplying(true);
    setError(null);

    const result = await applyMealPlanTemplate(authorizedFetch, template.id, subscriberId);

    if (result.ok) {
      onApplied(Number(subscriberId), result.data.id);
      return;
    }

    setError(t("applyFailed"));
    setApplying(false);
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
            <UtensilsCrossed size={20} strokeWidth={1.75} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {/*
              The name is the headline once one exists — a library of
              several similarly-sized templates is otherwise
              indistinguishable ("3 meals · 876 kcal" repeated). An
              unnamed template still shows honestly as unnamed rather
              than silently falling back to the meal-slot list as if
              that were its title.
            */}
            <p className="truncate text-sm font-semibold text-ink">
              {template.name ?? <span className="italic text-ink-muted">{t("unnamed")}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{t("mealsCount", { count: template.meals.length })}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <Flame size={13} strokeWidth={2} />
                <span className="tabular-nums">{t("perDay", { calories: dailyCalories })}</span>
              </span>
            </div>
            <p className="truncate text-xs text-ink-muted">
              {template.meals.map((meal) => tSlots(meal.name)).join(" · ")}
            </p>
            <span className="text-xs text-ink-muted/80">
              {t("createdAt", { date: new Date(template.created_at).toLocaleDateString() })}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-border px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          {expanded ? t("hideDetails") : t("showDetails")}
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/*
        The macro split stays visible whether or not the foods are
        expanded: it is what tells a nutritionist whether this template
        suits a given client's goal at all, before they read the items.
      */}
      <PlanMacroSummary plan={template} />

      {expanded && <PlanBreakdown plan={template} />}

      <div className="flex flex-col gap-2 border-t border-divider pt-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label={t("applyTo")}
            value={subscriberId}
            onChange={(e) => setSubscriberId(e.target.value)}
          >
            <option value="">{t("choosePatient")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} — {client.code}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={handleApply} disabled={!subscriberId} isLoading={applying} className="sm:w-auto">
          {applying ? t("applying") : t("apply")}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}

      <p className="text-xs text-ink-muted/80">{t("appliedNote")}</p>
    </div>
  );
}
