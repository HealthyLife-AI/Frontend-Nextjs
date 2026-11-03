"use client";

import { use, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText, LayoutDashboard, MessagesSquare, Settings2, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { ConsentStatus } from "@/components/clients/ConsentStatus";
import { getClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { getHealthProfile } from "@/lib/clients/api";
import { BmiSummary } from "@/components/clients/BmiSummary";
import type { HealthProfile } from "@/lib/clients/types";
import { getProgress } from "@/lib/progress/api";
import type { ProgressResponse } from "@/lib/progress/types";
import { AdherenceHeadline } from "@/components/progress/AdherenceHeadline";
import { BodyCompositionCards } from "@/components/progress/BodyCompositionCards";
import { PlanVsActualChart } from "@/components/progress/PlanVsActualChart";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { AiSummaryCard } from "@/components/aiSummaries/AiSummaryCard";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";
import { FollowUpBanner, FollowUpControls } from "@/components/clients/FollowUpControls";
import { ResetPasswordButton } from "@/components/clients/ResetPasswordButton";
import { MealLogSection } from "@/components/followUp/MealLogSection";
import { ReviewsPanel } from "@/components/followUp/ReviewsPanel";
import { PatientAppointmentCard } from "@/components/appointments/PatientAppointmentCard";
import { AlertSettingsCard } from "@/components/alerts/AlertSettingsCard";
import { MeasurementScheduleCard } from "@/components/healthRecords/MeasurementScheduleCard";
import { CheckinCard } from "@/components/checkins/CheckinCard";
import { FoodPreferencesCard } from "@/components/healthRecords/FoodPreferencesCard";
import { GoalProjectionCard } from "@/components/progress/GoalProjectionCard";
import { WeightInsightCard } from "@/components/progress/WeightInsightCard";
import { MorningPreviewCard } from "@/components/today/MorningPreviewCard";
import { ReportsCard } from "@/components/reports/ReportsCard";
import { WellbeingCard } from "@/components/progress/WellbeingCard";
import { PatientRequestsCard } from "@/components/quickRequests/PatientRequestsCard";
import { CurrentPlanCard } from "@/components/mealPlans/CurrentPlanCard";
import { PendingProposals } from "@/components/healthRecords/PendingProposals";
import { listAiSummaries } from "@/lib/aiSummaries/api";
import type { AiSummary } from "@/lib/aiSummaries/types";

/**
 * S4-07 / US-08 / UC-08: the Client Profile & Progress screen — the
 * summary header, then the AI weekly summary (S5-09), then weight trend,
 * plan-vs-actual and body composition, in the order the approved Stitch
 * reference (design-reference/.../nutricare_1) lays them out.
 *
 * Progress comes from ONE call (S4-04): `/clients/{id}/progress` carries
 * the weight series, the composition snapshots, the adherence block and
 * the daily-calorie series together, because this screen renders all
 * four and three round trips to paint one view is what NFR-01 is trying
 * to avoid.
 *
 * The mockup also shows an alerts panel and a recent-meals list. Alerts
 * are S5-08, wired to the roster-wide `/dashboard/alerts` page instead of
 * being duplicated here — the sidebar/header nav already point there, and
 * a per-client alert list is one `subscriber_id` filter away rather than
 * a second implementation. Its target-weight, body-fat-goal, macro-
 * adherence and water figures have no backing field anywhere in the API,
 * so they are not invented here (the rule S3-09 set for the plan designer).
 */
const TABS: { key: "overview" | "followUp" | "plan" | "settings"; hash: string; icon: LucideIcon }[] = [
  { key: "overview", hash: "overview", icon: LayoutDashboard },
  { key: "followUp", hash: "follow-up", icon: MessagesSquare },
  { key: "plan", hash: "plan", icon: UtensilsCrossed },
  { key: "settings", hash: "settings", icon: Settings2 },
];
type TabKey = (typeof TABS)[number]["key"];

/** Where the tab bar sticks: the fixed app header (72px) plus a 12px gap. Matches `top-[84px]` below. */
const TABS_STICKY_TOP = 84;

/** Anchors that live inside a tab: a deep link to one opens its tab (the appointments page links to #reviews). */
const ANCHOR_TAB: Record<string, TabKey> = { reviews: "followUp", requests: "followUp" };

function tabFromHash(hash: string): TabKey | null {
  const name = hash.replace(/^#/, "");
  return TABS.find((tab) => tab.hash === name)?.key ?? ANCHOR_TAB[name] ?? null;
}

/**
 * Layout (2026-11): the page grew to ~20 cards in one ~10,000px column as
 * features landed, so it is now a header, an action strip, and four tabs:
 *
 * - Above the tabs, whatever tab is open: the follow-up-ended banner,
 *   pending health-record proposals (the patient list's "pending" badge
 *   links here) and the next appointment.
 * - Overview: AI summary, adherence and the progress charts, goal
 *   projection, weight insight, sleep and wellbeing.
 * - Follow-up: session reviews (#reviews), requests, check-ins, meal log.
 * - Plan & health: current plan, morning preview, food preferences, reports.
 * - Settings: measurement schedule, alert thresholds, account actions.
 *
 * Every panel is rendered and the inactive ones are `hidden`, so each card
 * still loads once on arrival exactly as before and keeps its state across
 * tab switches. The tab is mirrored in the URL hash (replaceState, no
 * history entry), so a reload or a shared link reopens it.
 */
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("clients.detail");
  const tProgress = useTranslations("progress");
  const tGoals = useTranslations("goals");
  const tGoalType = useTranslations("healthRecords.goal");
  const goalText = (c: Client) => (c.goal_type ? tGoalType(c.goal_type) : tGoals(c.goal));
  const tCommon = useTranslations("common");
  const tBmi = useTranslations("clients.bmi");
  const { authorizedFetch } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [progressFailed, setProgressFailed] = useState(false);
  const [latestSummary, setLatestSummary] = useState<AiSummary | null>(null);
  // Height and age only, for the BMI line's fallback and its band (Item B).
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const tTabs = useTranslations("clients.detail.tabs");
  // Read once on mount. The tabs only render after the client loads, so the
  // server's render (no window) and the client's never differ here.
  const [tab, setTab] = useState<TabKey>(() => (typeof window === "undefined" ? null : tabFromHash(window.location.hash)) ?? "overview");
  const tabsTopRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const deepLinkHandled = useRef(false);

  // Back/forward or an in-page link changing the hash switches the tab too.
  useEffect(() => {
    const onHash = () => {
      const next = tabFromHash(window.location.hash);
      if (next) setTab(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // A deep link to an anchor inside a tab (#reviews) scrolls to it once the
  // page has content; the browser's own hash scroll ran before it existed.
  useEffect(() => {
    if (!client || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    const anchor = window.location.hash.slice(1);
    if (anchor in ANCHOR_TAB) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }));
  }, [client]);

  function selectTab(next: TabKey, focus = false) {
    setTab(next);
    window.history.replaceState(null, "", `#${TABS.find((x) => x.key === next)?.hash ?? ""}`);
    if (focus) tabRefs.current[TABS.findIndex((x) => x.key === next)]?.focus();
    // Scrolled past the tabs (the bar is stuck)? Bring the new panel's top into view. An explicit
    // offset rather than scrollIntoView: html's global `scroll-padding-top` (the landing header's)
    // would add itself to any scroll-margin here.
    const top = tabsTopRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < TABS_STICKY_TOP) window.scrollTo({ top: window.scrollY + top - TABS_STICKY_TOP });
  }

  // WAI-ARIA tabs: arrows move and select (mirrored in RTL), Home/End jump.
  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    const index = TABS.findIndex((x) => x.key === tab);
    const rtl = document.documentElement.dir === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    let next = index;
    if (step !== 0) next = (index + step + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    selectTab(TABS[next].key, true);
  }

  useEffect(() => {
    let cancelled = false;

    getClient(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setClient(result.data);
      } else {
        setNotFound(true);
      }
    });

    // Fetched alongside the client rather than after it: the two are
    // independent requests and chaining them would serialise two round
    // trips for no reason. A progress failure leaves the header usable.
    getProgress(authorizedFetch, id)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setProgress(result.data);
        } else {
          setProgressFailed(true);
        }
      })
      // A dropped connection rejects instead of returning a failed result;
      // without this the header badge would wait on a response that never comes.
      .catch(() => {
        if (!cancelled) setProgressFailed(true);
      });

    // Independent again: without a height there is no BMI to fall back
    // to, and without an age no band — a missing profile just means the
    // BMI line shows whatever it can.
    getHealthProfile(authorizedFetch, id)
      .then((result) => {
        if (!cancelled && result.ok) setProfile(result.data);
      })
      .catch(() => {});

    // Same reasoning: independent of both calls above. No summary yet is
    // a real, expected state (a brand-new client, or before Monday's
    // first run) — AiSummaryCard renders its own empty state for it, so
    // a failed/empty fetch here just leaves latestSummary null.
    listAiSummaries(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data.data.length > 0) {
        setLatestSummary(result.data.data[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, id]);

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">404</p>
        <Link href="/dashboard/patients" className="inline-flex items-center rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-xs font-bold text-mkt-teal-deep transition-colors hover:border-primary hover:bg-mkt-mint-bg">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (!client) {
    return <div className="py-16 text-center text-sm text-ink-muted">…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/dashboard/patients"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-ink-muted shadow-panel transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {t("backToList")}
      </Link>

      {/*
        Patient header in the landing page's hero language: a deep-teal
        banner carrying identity + the two next actions, over a white
        facts strip. Same data and links as before, regrouped.
      */}
      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <div className="relative overflow-hidden bg-gradient-to-br from-mkt-teal-deep via-mkt-teal-cta to-mkt-dark-bg p-6 text-white sm:p-7">
          <div className="pointer-events-none absolute -top-24 end-[-3rem] h-64 w-64 rounded-full bg-mkt-mint/25 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold ring-4 ring-white/15 backdrop-blur">
                {client.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold leading-tight">{client.name}</h1>
                <span className="w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold tracking-wide" dir="ltr">
                  {client.code}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`/dashboard/patients/${client.id}/plan`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-white px-5 text-sm font-bold text-mkt-teal-deep shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <UtensilsCrossed size={18} strokeWidth={2} />
                {t("planLink")}
              </Link>
              <Link
                href={`/dashboard/patients/${client.id}/health-profile`}
                className="inline-flex h-11 items-center gap-2 rounded-field border border-white/30 bg-white/10 px-5 text-sm font-bold backdrop-blur transition-colors hover:bg-white/20"
              >
                <FileText size={18} strokeWidth={2} />
                {t("healthProfileLink")}
              </Link>
            </div>
          </div>
        </div>

        {/* Six facts: 2 / 3 / 6 columns (the old 5-column grid left "adherence" alone on a
            second row). On one row the columns size to their content, so a long status pill
            ("hasn't signed in yet") doesn't wrap inside a fixed sixth. Hairlines come from a
            1px gap over the divider color, so they stay right at every column count. */}
        <dl className="grid grid-cols-2 gap-px bg-divider text-sm sm:grid-cols-3 lg:grid-cols-[repeat(6,auto)] [&>div]:bg-card">
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("phoneLabel")}</dt>
            <dd className="font-bold text-ink" dir="ltr">
              {client.phone ?? "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("usernameLabel")}</dt>
            <dd>
              {client.username ? (
                <span className="font-bold text-ink" dir="ltr">
                  {client.username}
                </span>
              ) : (
                <span className="inline-flex w-fit rounded-full bg-status-attention-bg px-2.5 py-0.5 text-xs font-bold text-status-attention">{t("noUsername")}</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("goalLabel")}</dt>
            <dd className="font-bold text-ink">{goalText(client)}</dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("statusLabel")}</dt>
            <dd>
              <ClientStatusBadge status={client.status} />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{tBmi("label")}</dt>
            <dd>
              <BmiSummary
                enteredBmi={progress?.body_composition.latest?.bmi}
                recordedAt={progress?.body_composition.latest?.recorded_at ?? null}
                weightKg={progress?.body_composition.latest?.weight_kg ?? profile?.weight_kg ?? null}
                heightCm={profile?.height_cm ?? null}
                age={profile?.age ?? null}
              />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <dt className="text-xs font-semibold text-ink-muted">{t("adherenceLabel")}</dt>
            {/*
              The same live classification as the adherence box below
              (progress.adherence.status), not the stored column: that one is
              only refreshed when the patient logs and by the 06:00 job, so it
              can disagree with the box for the rest of the day. The stored
              value is the fallback only if the progress call failed; a
              placeholder holds the place while it loads so a stale value is
              never shown first.
            */}
            <dd>
              {progress ? (
                <AdherenceBadge status={progress.adherence.status} />
              ) : progressFailed ? (
                <AdherenceBadge status={client.adherence_status} />
              ) : (
                <span className="inline-block h-6 w-24 animate-pulse rounded-full bg-ink-muted/10" role="status" aria-label={tCommon("loading")} />
              )}
            </dd>
          </div>
        </dl>

        {client.consent && <ConsentStatus consent={client.consent} />}
      </section>

      {client.archived_at && <FollowUpBanner client={client} onChange={setClient} />}

      {/* Needs-action strip, shown whatever tab is open. Each renders nothing when empty. */}
      <PendingProposals subscriberId={id} readOnly={client.archived_at !== null} />
      <PatientAppointmentCard subscriberId={id} subscriberName={client.name} readOnly={client.archived_at !== null} />

      <div ref={tabsTopRef} className="-mb-6" aria-hidden="true" />
      <div className="sticky top-[84px] z-10">
        <div
          role="tablist"
          aria-label={tTabs("label")}
          onKeyDown={onTabKey}
          className="flex w-full gap-0.5 overflow-x-auto rounded-full border border-border/70 bg-white/85 p-1 shadow-panel backdrop-blur-xl [scrollbar-width:none] sm:w-fit sm:gap-1 [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ key, icon: Icon }, i) => {
            const selected = tab === key;
            return (
              <button
                key={key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`patient-tab-${key}`}
                aria-selected={selected}
                aria-controls={`patient-panel-${key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(key)}
                className={`inline-flex h-10 shrink-0 grow items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 text-[13px] font-semibold transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:grow-0 sm:px-4 sm:text-sm ${
                  selected ? "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand" : "text-ink-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={16} strokeWidth={1.75} className="hidden sm:block" aria-hidden="true" />
                {tTabs(key)}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id="patient-panel-overview" aria-labelledby="patient-tab-overview" hidden={tab !== "overview"} className="flex flex-col gap-6">
        {progressFailed && (
          <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {tProgress("loadFailed")}
          </p>
        )}

        <AiSummaryCard summary={latestSummary} />

        {progress && (
          <div className="flex flex-col gap-4">
            <AdherenceHeadline adherence={progress.adherence} />
            <WeightTrendChart points={progress.weight_trend} />
            <PlanVsActualChart days={progress.daily_calories} />
            <BodyCompositionCards
              latest={progress.body_composition.latest}
              previous={progress.body_composition.previous}
              change={progress.body_composition.change}
            />
          </div>
        )}

        <GoalProjectionCard subscriberId={id} readOnly={client.archived_at !== null} />
        <WeightInsightCard subscriberId={id} readOnly={client.archived_at !== null} />
        <WellbeingCard subscriberId={id} />
      </div>

      <div role="tabpanel" id="patient-panel-followUp" aria-labelledby="patient-tab-followUp" hidden={tab !== "followUp"} className="flex flex-col gap-6">
        {/* Lands just under the sticky tab bar: html's scroll-padding-top (6rem) plus this margin. */}
        <div id="reviews" className="scroll-mt-14">
          <ReviewsPanel subscriberId={id} readOnly={client.archived_at !== null} />
        </div>
        <PatientRequestsCard subscriberId={id} readOnly={client.archived_at !== null} />
        <CheckinCard subscriberId={id} readOnly={client.archived_at !== null} />
        <MealLogSection subscriberId={id} />
      </div>

      <div role="tabpanel" id="patient-panel-plan" aria-labelledby="patient-tab-plan" hidden={tab !== "plan"} className="flex flex-col gap-6">
        <CurrentPlanCard subscriberId={id} />
        <MorningPreviewCard subscriberId={id} />
        <FoodPreferencesCard subscriberId={id} readOnly={client.archived_at !== null} />
        <ReportsCard subscriberId={id} readOnly={client.archived_at !== null} />
      </div>

      <div role="tabpanel" id="patient-panel-settings" aria-labelledby="patient-tab-settings" hidden={tab !== "settings"} className="flex flex-col gap-6">
        <MeasurementScheduleCard subscriberId={id} readOnly={client.archived_at !== null} />
        <AlertSettingsCard subscriberId={id} readOnly={client.archived_at !== null} />

        {/* Account actions, away from the everyday actions in the header. */}
        <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-ink">{tTabs("accountActions")}</h2>
          <div className="flex flex-wrap gap-2.5">
            {!client.archived_at && <ResetPasswordButton client={client} onUsername={(username) => setClient({ ...client, username })} />}
            {!client.archived_at && <FollowUpControls client={client} onChange={setClient} />}
            <DeleteClientButton client={client} />
          </div>
        </section>
      </div>
    </div>
  );
}
