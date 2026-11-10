"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, FileText, MessageSquareMore, Send, User } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { useOpenRequests } from "@/components/quickRequests/OpenRequestsProvider";
import { useRequestReply } from "@/components/quickRequests/useRequestReply";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatListDateTime, formatLongDate, formatShortDay } from "@/lib/format/date";
import { listMealPlans } from "@/lib/mealPlans/api";
import { getProgress } from "@/lib/progress/api";
import type { AdherenceDirection } from "@/lib/progress/types";
import { listQuickRequests, type QuickRequest } from "@/lib/quickRequests/api";

/** What the nutritionist glances at before replying; a null field hides its box. */
type PatientContext = {
  planCalories: number | null;
  adherencePercent: number | null;
  adherenceStatus: AdherenceDirection | null;
  weightKg: number | null;
  weightChangeKg: number | null;
};

/**
 * Phase 1, E6: every patient's OPEN request, as an inbox: the list on the
 * start side, the selected request with its context and the reply box beside
 * it (stacked, list first, when the card is narrower than the two panes).
 * The selection lives in `?request=ID`, which is also where an alert's
 * «فتح الطلب» lands; an id that is not in the list (already answered, or
 * none given) falls back to the newest request.
 *
 * An answered or closed request leaves the list at once, the next one is
 * selected, and the sidebar count drops; its history stays on the patient's
 * profile (PatientRequestsCard).
 */
export default function RequestsPage() {
  const t = useTranslations("quickRequests");
  const tNav = useTranslations("nav");
  const { authorizedFetch } = useAuth();
  const { refresh } = useOpenRequests();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<QuickRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  // Per patient, for the page's lifetime: reselecting a request does not refetch.
  const contextCache = useRef(new Map<number, Promise<PatientContext>>());
  const detailRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await listQuickRequests(authorizedFetch, "open");
    if (r.ok) setRequests(r.data.data);
    else setFailed(true);
  }, [authorizedFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const wanted = Number(searchParams.get("request") ?? "");
  const selected = requests?.find((r) => r.id === wanted) ?? requests?.[0] ?? null;

  function select(id: number | null, reveal = false) {
    router.replace({ pathname: "/dashboard/requests", query: id === null ? {} : { request: String(id) } }, { scroll: false });
    // Stacked panes (narrow screens): bring the request into view. A no-op when it already is.
    if (reveal) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: "nearest" }));
  }

  function handleDone(done: QuickRequest) {
    // Answered or closed: no longer open, so it leaves the list and the next one opens.
    const list = requests ?? [];
    const index = list.findIndex((r) => r.id === done.id);
    const rest = list.filter((r) => r.id !== done.id);
    setRequests(rest);
    select((rest[index] ?? rest[index - 1] ?? null)?.id ?? null);
    refresh();
  }

  const loadContext = useCallback(
    (subscriberId: number) => {
      const cached = contextCache.current.get(subscriberId);
      if (cached) return cached;

      // The two calls the patient page already makes; a failed one just leaves its boxes out.
      const promise = Promise.all([getProgress(authorizedFetch, subscriberId).catch(() => null), listMealPlans(authorizedFetch, subscriberId).catch(() => null)]).then(
        ([progress, plans]): PatientContext => {
          const p = progress?.ok ? progress.data : null;
          const active = plans?.ok ? (plans.data.find((plan) => plan.status === "active") ?? null) : null;
          const days = active ? Object.values(active.summary_by_day) : [];
          const trend = p?.weight_trend ?? [];

          return {
            planCalories: active ? (active.approved_calories ?? (days.length > 0 ? Math.round(days.reduce((sum, d) => sum + d.calories, 0) / days.length) : null)) : null,
            adherencePercent: p?.adherence.adherence_percent ?? null,
            adherenceStatus: p?.adherence.status ?? null,
            weightKg: p?.body_composition.latest?.weight_kg ?? trend[trend.length - 1]?.weight_kg ?? null,
            weightChangeKg: trend.length >= 2 ? trend[trend.length - 1].weight_kg - trend[0].weight_kg : null,
          };
        }
      );
      contextCache.current.set(subscriberId, promise);
      return promise;
    },
    [authorizedFetch]
  );

  return (
    <PageContainer variant="list">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          !!requests?.length && (
            <span className="inline-flex min-h-9 items-center rounded-full bg-status-attention-bg px-3.5 text-sm font-bold text-status-attention-ink">
              {tNav("openRequestsBadge", { count: requests.length })}
            </span>
          )
        }
      />

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
          {t("loadFailed")}
        </p>
      )}

      {requests === null && !failed && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {requests?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-border/70 bg-card py-16 text-center shadow-panel">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquareMore size={22} strokeWidth={1.75} />
          </div>
          <p className="max-w-xs text-sm text-ink-muted">{t("empty")}</p>
        </div>
      )}

      {!!requests?.length && selected && (
        // Two panes once the card itself is wide enough for both (340 + 420px), whatever the viewport.
        <div className="@container overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
          <div className="flex flex-col @3xl:flex-row">
            <nav aria-label={t("listLabel")} className="flex min-w-0 flex-col border-b border-divider @3xl:max-w-[400px] @3xl:grow @3xl:basis-[340px] @3xl:border-b-0 @3xl:border-e">
              <div className="flex items-baseline justify-between gap-3 border-b border-divider px-5 py-3.5">
                <span className="text-sm font-bold text-ink">{t("openCount", { count: requests.length })}</span>
                <span className="text-xs text-ink-muted">{t("newestFirst")}</span>
              </div>
              <ul className="flex flex-col gap-1 p-2">
                {requests.map((request) => (
                  <li key={request.id}>
                    <RequestListItem request={request} selected={request.id === selected.id} onSelect={() => select(request.id, true)} />
                  </li>
                ))}
              </ul>
            </nav>

            <div ref={detailRef} className="min-w-0 scroll-mt-24 @3xl:grow-[999] @3xl:basis-[420px]">
              <RequestDetail key={selected.id} request={selected} loadContext={loadContext} onDone={handleDone} />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function useDayLabels() {
  const tCommon = useTranslations("common");
  return { today: tCommon("today"), yesterday: tCommon("yesterday") };
}

function ReasonBadge({ request }: { request: QuickRequest }) {
  const t = useTranslations("quickRequests");
  // "I can't stick to it" is the one that risks losing the patient.
  return <Badge tone={request.reason === "cannot_continue" ? "danger" : "primary"}>{t(`reason.${request.reason}`)}</Badge>;
}

function RequestListItem({ request, selected, onSelect }: { request: QuickRequest; selected: boolean; onSelect: () => void }) {
  const t = useTranslations("quickRequests");
  const locale = useLocale();
  const labels = useDayLabels();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected ? "bg-primary/[0.07] shadow-[inset_0_0_0_2px_var(--color-primary)]" : "hover:bg-canvas"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${selected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`} aria-hidden="true">
        {request.subscriber_name?.charAt(0)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate">
            <span className="text-sm font-bold text-ink">{request.subscriber_name}</span> <span className="text-xs text-ink-muted">{request.subscriber_code}</span>
          </span>
          <time dateTime={request.created_at} className="shrink-0 text-xs tabular-nums text-ink-muted">
            {formatListDateTime(request.created_at, locale, labels)}
          </time>
        </span>
        <span className="flex flex-wrap gap-1.5">
          <ReasonBadge request={request} />
          {request.occasion_date && <Badge tone="warning">{formatShortDay(request.occasion_date, locale)}</Badge>}
        </span>
        <span className={`truncate text-sm ${request.note ? "text-ink" : "text-ink-muted"}`}>{request.note ?? t("noNote")}</span>
      </span>
    </button>
  );
}

function RequestDetail({
  request,
  loadContext,
  onDone,
}: {
  request: QuickRequest;
  loadContext: (subscriberId: number) => Promise<PatientContext>;
  onDone: (request: QuickRequest) => void;
}) {
  const t = useTranslations("quickRequests");
  const locale = useLocale();
  const labels = useDayLabels();
  const { reply, setReply, busy, error, canSend, send, close } = useRequestReply(request, onDone);
  const patientHref = `/dashboard/patients/${request.subscriber_id}`;

  return (
    <article className="flex flex-col gap-5 p-5 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-extrabold text-primary" aria-hidden="true">
            {request.subscriber_name?.charAt(0)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-xl font-extrabold text-ink">{request.subscriber_name}</span>
              <span className="text-sm font-normal text-ink-muted">{request.subscriber_code}</span>
            </h2>
            <p className="text-sm text-ink-muted">{t("requestedAt", { date: formatListDateTime(request.created_at, locale, labels) })}</p>
          </div>
        </div>
        <Link
          href={patientHref}
          className="inline-flex h-11 items-center gap-2 rounded-field border border-primary/40 px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-mkt-mint-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <User size={17} strokeWidth={1.9} aria-hidden="true" />
          {t("openPatient")}
        </Link>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-canvas p-5">
        <div className="flex flex-wrap gap-1.5">
          <ReasonBadge request={request} />
          <Badge tone="warning">{t("status.open")}</Badge>
        </div>
        <p className={`whitespace-pre-line break-words text-[17px] leading-relaxed ${request.note ? "text-ink" : "text-ink-muted"}`}>{request.note ?? t("noNote")}</p>
        {request.occasion_date && (
          <p className="flex items-center gap-2 text-sm font-bold text-status-attention-ink">
            <Calendar size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {t("occasionOn", { date: formatLongDate(request.occasion_date, locale) })}
          </p>
        )}
      </div>

      {request.subscriber_id !== undefined && <ContextBoxes subscriberId={request.subscriber_id} loadContext={loadContext} />}

      <div className="flex flex-col gap-2">
        <label htmlFor={`reply-${request.id}`} className="text-sm font-bold text-ink">
          {t("replyLabel")}
        </label>
        <textarea
          id={`reply-${request.id}`}
          rows={4}
          maxLength={1000}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("replyPlaceholder")}
          className="rounded-field border border-border bg-canvas/60 p-3.5 text-sm leading-relaxed text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
        />
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>{t("replyNote")}</span>
          <span className="tabular-nums" dir="ltr">
            {reply.length} / 1000
          </span>
        </div>
        {error && (
          <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2 text-sm text-status-late-ink">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" onClick={send} isLoading={busy === "send"} disabled={!canSend || busy !== null}>
          {busy !== "send" && <Send size={17} strokeWidth={1.9} className="rtl:-scale-x-100" aria-hidden="true" />}
          {t("send")}
        </Button>
        <Button type="button" variant="secondary" onClick={close} isLoading={busy === "close"} disabled={busy !== null}>
          {t("close")}
        </Button>
        <Link
          href={`${patientHref}/plan`}
          className="ms-auto inline-flex min-h-11 items-center gap-2 rounded-field px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <FileText size={17} strokeWidth={1.9} aria-hidden="true" />
          {t("openPlan")}
        </Link>
      </div>
    </article>
  );
}

/** «قبل أن ترد»: the plan, the adherence and the weight, each shown only when there is data for it. */
function ContextBoxes({ subscriberId, loadContext }: { subscriberId: number; loadContext: (subscriberId: number) => Promise<PatientContext> }) {
  const t = useTranslations("quickRequests");
  const tAdherence = useTranslations("adherence");
  const locale = useLocale();
  const [context, setContext] = useState<PatientContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadContext(subscriberId).then((c) => {
      if (!cancelled) setContext(c);
    });
    return () => {
      cancelled = true;
    };
  }, [subscriberId, loadContext]);

  const number = (n: number, options: Intl.NumberFormatOptions = {}) => new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { maximumFractionDigits: 1, ...options }).format(n);
  const grid = "grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-3";
  const box = "flex flex-col gap-0.5 rounded-xl border border-border bg-card px-4 py-3";

  if (!context) {
    return (
      <section className="flex flex-col gap-3" aria-busy="true">
        <h3 className="text-sm font-bold text-ink">{t("beforeReply")}</h3>
        <div className={grid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[84px] animate-pulse rounded-xl bg-ink-muted/10" />
          ))}
        </div>
      </section>
    );
  }

  const hasPlan = context.planCalories !== null;
  const hasAdherence = context.adherencePercent !== null;
  const hasWeight = context.weightKg !== null;
  if (!hasPlan && !hasAdherence && !hasWeight) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-ink">{t("beforeReply")}</h3>
      <dl className={grid}>
        {hasPlan && (
          <div className={box}>
            <dt className="text-xs text-ink-muted">{t("ctxPlan")}</dt>
            <dd className="text-lg font-extrabold tabular-nums text-ink">{t("ctxPlanValue", { kcal: number(context.planCalories ?? 0, { maximumFractionDigits: 0 }) })}</dd>
            <dd>
              <Link href={`/dashboard/patients/${subscriberId}/plan`} className="text-xs font-semibold text-primary hover:underline">
                {t("openPlan")}
              </Link>
            </dd>
          </div>
        )}
        {hasAdherence && (
          <div className={box}>
            <dt className="text-xs text-ink-muted">{t("ctxAdherence")}</dt>
            <dd className="text-lg font-extrabold tabular-nums text-ink">{number(context.adherencePercent ?? 0, { maximumFractionDigits: 0 })}%</dd>
            {context.adherenceStatus && <dd className="text-xs text-ink-muted">{tAdherence(context.adherenceStatus)}</dd>}
          </div>
        )}
        {hasWeight && (
          <div className={box}>
            <dt className="text-xs text-ink-muted">{t("ctxWeight")}</dt>
            <dd className="text-lg font-extrabold tabular-nums text-ink">{t("ctxWeightValue", { kg: number(context.weightKg ?? 0) })}</dd>
            {context.weightChangeKg !== null && (
              <dd className="text-xs tabular-nums text-ink-muted">{t("ctxWeightChange", { change: number(context.weightChangeKg, { signDisplay: "exceptZero" }) })}</dd>
            )}
          </div>
        )}
      </dl>
    </section>
  );
}
