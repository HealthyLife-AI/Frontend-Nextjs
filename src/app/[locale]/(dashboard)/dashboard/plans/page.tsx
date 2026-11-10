"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowRight, ChevronDown, Info, Plus, Search, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { PlanBreakdown } from "@/components/mealPlans/PlanBreakdown";
import { displayGrams, planMacros, planToSlots } from "@/components/mealPlans/mealSlots";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { formatLongDate } from "@/lib/format/date";
import { applyMealPlanTemplate, listMealPlanTemplates } from "@/lib/mealPlans/api";
import type { MealPlan } from "@/lib/mealPlans/types";

type Sort = "newest" | "caloriesAsc" | "caloriesDesc";

const LINK_BUTTON = "inline-flex h-11 items-center justify-center gap-2 rounded-field px-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const LINK_PRIMARY = `${LINK_BUTTON} bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand hover:brightness-110`;
const LINK_SECONDARY = `${LINK_BUTTON} border border-primary/40 bg-card text-primary hover:border-primary hover:bg-mkt-mint-bg`;

/**
 * A template carries no day-specific meals in the common case, so its whole
 * daily total sits under key "0" — average whatever keys exist rather than
 * assuming that one.
 */
function dailyCalories(template: MealPlan): number {
  const days = Object.values(template.summary_by_day);
  return Math.round(days.reduce((total, day) => total + day.calories, 0) / Math.max(days.length, 1));
}

/**
 * S3-03 / FR-15: the nutritionist's template library — the "Plans" nav item.
 *
 * Deliberately NOT a roster-wide list of every client's plan: plans are
 * fetched per subscriber and no endpoint returns them across the roster.
 * What IS reusable across clients is the template library.
 *
 * With templates: a toolbar (name search and sort, both client-side) over a
 * grid of cards, each with its macro split and an apply row. Without: a
 * hero that explains what a template is and how to make the first one, a
 * shortcut list of active clients' plans, and a preview of the card.
 *
 * Applying a template creates a DRAFT (BR-6/BR-10), so this navigates
 * straight to that client's plan designer rather than implying the client
 * can already see it.
 */
export default function PlansPage() {
  const t = useTranslations("plans");
  const { authorizedFetch } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<MealPlan[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

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
    // one hasn't signed in yet, so they have no app to see it in.
    listClients(authorizedFetch, { status: "active" }).then((result) => {
      if (!cancelled && result.ok) setClients(result.data.data);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const list = (templates ?? []).filter((template) => needle === "" || (template.name ?? "").toLocaleLowerCase().includes(needle));

    return list.sort((a, b) => {
      if (sort === "caloriesAsc") return dailyCalories(a) - dailyCalories(b);
      if (sort === "caloriesDesc") return dailyCalories(b) - dailyCalories(a);
      return b.created_at.localeCompare(a.created_at);
    });
  }, [templates, search, sort]);

  const empty = templates?.length === 0 && !loadFailed;

  return (
    <PageContainer variant="list">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          templates !== null &&
          !loadFailed && (
            <Link href="/dashboard/patients" className={empty ? LINK_PRIMARY : LINK_SECONDARY}>
              <Plus size={18} strokeWidth={1.9} aria-hidden="true" />
              {t("createFromPlan")}
            </Link>
          )
        }
      />

      {loadFailed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
          {t("loadFailed")}
        </p>
      )}

      {templates === null && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {empty && <EmptyState clients={clients} />}

      {!!templates?.length && (
        <>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-panel border border-border/70 bg-card p-4 shadow-panel">
            <div className="relative w-full min-w-0 sm:w-72">
              <Search size={17} strokeWidth={1.9} className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="h-12 w-full rounded-field border border-border bg-canvas/60 ps-10 pe-3.5 text-sm text-ink outline-none transition-all placeholder:text-ink-muted hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select label={t("sortLabel")} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="newest">{t("sortNewest")}</option>
                <option value="caloriesAsc">{t("sortCaloriesAsc")}</option>
                <option value="caloriesDesc">{t("sortCaloriesDesc")}</option>
              </Select>
            </div>
            <p className="ms-auto flex min-h-12 max-w-md items-center gap-2 text-sm text-ink-muted">
              <Info size={16} strokeWidth={1.9} className="shrink-0" aria-hidden="true" />
              {t("toolbarNote", { count: templates.length })}
            </p>
          </div>

          {visible.length === 0 && <p className="rounded-panel border border-border/70 bg-card py-10 text-center text-sm text-ink-muted shadow-panel">{t("noMatch")}</p>}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] items-start gap-4">
            {visible.map((template) => (
              <TemplateCard key={template.id} template={template} clients={clients} onApplied={(subscriberId, planId) => router.push(`/dashboard/patients/${subscriberId}/plan?planId=${planId}`)} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

/**
 * The macro split as one stacked bar and a legend. Shares are of CALORIES,
 * not grams (protein/carbs 4 kcal/g, fat 9) — the same math as
 * `PlanMacroSummary` and the designer's summary panel.
 */
function MacroBar({ template }: { template: MealPlan }) {
  const t = useTranslations("plans");
  const tMacro = useTranslations("planDesigner.summary");
  const macros = planMacros(planToSlots(template));

  const calories = { protein: macros.protein_g * 4, carbs: macros.carbs_g * 4, fat: macros.fat_g * 9 };
  const total = calories.protein + calories.carbs + calories.fat || 1;
  const rows = [
    { key: "protein", grams: macros.protein_g, percent: Math.round((calories.protein / total) * 100), fill: "bg-primary-hover" },
    { key: "carbs", grams: macros.carbs_g, percent: Math.round((calories.carbs / total) * 100), fill: "bg-macro-carbs" },
    { key: "fat", grams: macros.fat_g, percent: Math.round((calories.fat / total) * 100), fill: "bg-macro-fat" },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={t("macroBarLabel", { protein: rows[0].percent, carbs: rows[1].percent, fat: rows[2].percent })} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {rows.map((row) => (
          <span key={row.key} className={`h-full ${row.fill}`} style={{ flexGrow: Math.max(row.percent, 0.5), flexBasis: 0 }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-1.5 tabular-nums">
            <span className={`h-2 w-2 shrink-0 rounded-full ${row.fill}`} aria-hidden="true" />
            {t("macroLegend", { label: tMacro(row.key), grams: displayGrams(row.grams), percent: row.percent })}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TemplateCard({ template, clients, onApplied }: { template: MealPlan; clients: Client[]; onApplied: (subscriberId: number, planId: number) => void }) {
  const t = useTranslations("plans");
  const tSlots = useTranslations("planDesigner.mealSlots");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [subscriberId, setSubscriberId] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Collapsed by default so a library of a dozen templates stays scannable;
  // the macro split narrows the choice, the food list confirms it.
  const [expanded, setExpanded] = useState(false);

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
    <article className={`flex flex-col gap-2.5 rounded-panel border border-border/70 bg-card p-[18px] shadow-panel ${expanded ? "col-span-full" : ""}`}>
      {/* An unnamed template shows honestly as unnamed rather than borrowing its meal list as a title. */}
      <h2 className="break-words text-[17px] font-extrabold leading-snug text-ink">{template.name ?? <span className="font-bold italic text-ink-muted">{t("unnamed")}</span>}</h2>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge tone="primary">{t("mealsCount", { count: template.meals.length })}</Badge>
        <span className="text-sm font-bold tabular-nums text-ink">{t("perDay", { calories: dailyCalories(template) })}</span>
      </div>

      <p className="truncate text-sm text-ink-muted">{template.meals.map((meal) => tSlots(meal.name)).join(" · ")}</p>

      <MacroBar template={template} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-ink-muted">{t("createdAt", { date: formatLongDate(template.created_at.slice(0, 10), locale) })}</span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-field px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {expanded ? t("hideDetails") : t("showDetails")}
          <ChevronDown size={16} strokeWidth={2} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {expanded && <PlanBreakdown plan={template} />}

      <div className="mt-1 flex items-end gap-2 border-t border-divider pt-3">
        <div className="min-w-0 flex-1">
          <Select label={t("applyTo")} value={subscriberId} onChange={(e) => setSubscriberId(e.target.value)}>
            <option value="">{t("choosePatient")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} — {client.code}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" onClick={handleApply} disabled={!subscriberId} isLoading={applying} className="h-12 shrink-0">
          {applying ? t("applying") : t("apply")}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
          {error}
        </p>
      )}
    </article>
  );
}

function EmptyState({ clients }: { clients: Client[] }) {
  const t = useTranslations("plans");
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];
  const shortlist = clients.slice(0, 5);

  return (
    <>
      <section className="flex flex-col gap-5 rounded-panel border border-border/70 bg-card p-6 shadow-panel sm:p-8">
        <div className="flex flex-col gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UtensilsCrossed size={26} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h2 className="text-xl font-extrabold text-ink">{t("empty")}</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">{t("emptyLead")}</p>
        </div>

        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-2xl bg-canvas p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold tabular-nums text-white" aria-hidden="true">
                {i + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-bold text-ink">{step.title}</span>
                <span className="text-sm text-ink-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="flex items-start gap-2 text-sm text-ink-muted">
          <Info size={16} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t("emptyFootnote")}
        </p>
      </section>

      <div className="flex flex-wrap gap-4">
        <section className="flex min-w-0 grow-[3] basis-[360px] flex-col gap-3 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">{t("startFromExisting")}</h2>
            <Link href="/dashboard/patients" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">
              {t("allPatients")}
            </Link>
          </div>

          {shortlist.length === 0 ? (
            <Link href="/dashboard/patients/new" className={`${LINK_SECONDARY} w-fit`}>
              <Plus size={18} strokeWidth={1.9} aria-hidden="true" />
              {t("addFirstPatient")}
            </Link>
          ) : (
            <ul className="divide-y divide-divider">
              {shortlist.map((client) => (
                <li key={client.id} className="flex items-center gap-3 py-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden="true">
                    {client.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-sm font-bold text-ink">{client.name}</span> <span className="text-xs text-ink-muted">{client.code}</span>
                  </span>
                  <Link
                    href={`/dashboard/patients/${client.id}/plan`}
                    className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {t("openPlan")}
                    <ArrowRight size={15} strokeWidth={2} className="rtl:-scale-x-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex min-w-0 grow-[2] basis-[280px] flex-col gap-3 rounded-panel border border-dashed border-border bg-canvas p-5">
          <h2 className="text-base font-bold text-ink">{t("previewTitle")}</h2>
          {/* A static skeleton of the template card: shapes only, nothing to read. */}
          <div aria-hidden="true" className="flex flex-col gap-2.5 rounded-panel border border-border/70 bg-card p-[18px]">
            <span className="h-4 w-2/3 rounded-full bg-ink-muted/25" />
            <span className="flex gap-2">
              <span className="h-6 w-20 rounded-full bg-primary/15" />
              <span className="h-6 w-24 rounded-full bg-ink-muted/15" />
            </span>
            <span className="h-3 w-4/5 rounded-full bg-ink-muted/15" />
            <span className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              <span className="h-full w-1/4 bg-primary-hover" />
              <span className="h-full w-[45%] bg-macro-carbs" />
              <span className="h-full flex-1 bg-macro-fat" />
            </span>
            <span className="flex items-center gap-2 border-t border-divider pt-3">
              <span className="h-10 flex-1 rounded-field bg-ink-muted/10" />
              <span className="h-10 w-20 rounded-field bg-primary/70" />
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">{t("previewCaption")}</p>
        </section>
      </div>
    </>
  );
}
