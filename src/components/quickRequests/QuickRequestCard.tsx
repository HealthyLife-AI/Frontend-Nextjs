"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { closeQuickRequest, respondToQuickRequest, type QuickRequest } from "@/lib/quickRequests/api";

/**
 * Phase 1, E6: one patient request. An open one carries the reply box and
 * the two quick links («فتح الخطة», «فتح ملف المريض»); an answered or closed
 * one shows what was said. The reply is plain text for the patient's app and
 * never changes their plan.
 */
export function QuickRequestCard({
  request,
  showPatient,
  readOnly = false,
  onChanged,
}: {
  request: QuickRequest;
  /** Name the patient (the roster-wide list); the patient's own history leaves it out. */
  showPatient: boolean;
  readOnly?: boolean;
  onChanged: (next: QuickRequest) => void;
}) {
  const t = useTranslations("quickRequests");
  const format = useFormatter();
  const { authorizedFetch } = useAuth();

  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" });
  const day = (ymd: string) => format.dateTime(new Date(`${ymd}T00:00:00`), { dateStyle: "medium", numberingSystem: "latn" });
  const open = request.status === "open";

  async function run(action: () => ReturnType<typeof respondToQuickRequest>) {
    setBusy(true);
    setError(null);
    const r = await action();
    setBusy(false);

    if (!r.ok) {
      setError(r.error.errors?.response?.[0] ?? r.error.message ?? t("failed"));
      return;
    }

    onChanged({ ...request, ...r.data });
  }

  return (
    <article className={`flex flex-col gap-3 rounded-panel border bg-card p-4 shadow-panel ${open ? "border-primary/30" : "border-border/70"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {showPatient && request.subscriber_id !== undefined && (
          <Link href={`/dashboard/patients/${request.subscriber_id}`} className="text-sm font-bold text-ink hover:text-primary hover:underline">
            {request.subscriber_name}
          </Link>
        )}
        {showPatient && <span className="text-xs text-ink-muted">{request.subscriber_code}</span>}
        <Badge tone="primary">{t(`reason.${request.reason}`)}</Badge>
        <Badge tone={open ? "warning" : request.status === "answered" ? "success" : "neutral"}>{t(`status.${request.status}`)}</Badge>
        <span className="ms-auto text-xs text-ink-muted">{date(request.created_at)}</span>
      </div>

      <p className="text-sm leading-relaxed text-ink">{request.note ?? <span className="text-ink-muted">{t("noNote")}</span>}</p>
      {request.occasion_date && <p className="text-xs font-semibold text-ink-muted">{t("occasionOn", { date: day(request.occasion_date) })}</p>}

      {request.response && (
        <div className="rounded-field bg-status-on-track-bg px-3.5 py-2.5 text-sm text-ink">
          <span className="block text-xs font-bold text-status-on-track">{t("yourReply")}</span>
          <p className="whitespace-pre-line">{request.response}</p>
        </div>
      )}

      {open && !readOnly && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`reply-${request.id}`} className="text-xs font-semibold text-ink-muted">
            {t("replyLabel")}
          </label>
          <textarea
            id={`reply-${request.id}`}
            rows={3}
            maxLength={1000}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t("replyPlaceholder")}
            className="rounded-field border border-border bg-canvas/60 p-3 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
          <p className="text-xs text-ink-muted">{t("replyNote")}</p>
          {error && (
            <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2 text-sm text-status-late">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href={`/dashboard/patients/${request.subscriber_id}/plan`} className="text-primary hover:underline">
                {t("openPlan")}
              </Link>
              <Link href={`/dashboard/patients/${request.subscriber_id}`} className="text-primary hover:underline">
                {t("openPatient")}
              </Link>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={busy} onClick={() => run(() => closeQuickRequest(authorizedFetch, request.id))}>
                {t("close")}
              </Button>
              <Button isLoading={busy} disabled={reply.trim() === ""} onClick={() => run(() => respondToQuickRequest(authorizedFetch, request.id, reply.trim()))}>
                {t("send")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
