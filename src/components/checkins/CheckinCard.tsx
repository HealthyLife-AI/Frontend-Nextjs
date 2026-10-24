"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getCheckinSettings,
  listCheckins,
  removeCheckinSettings,
  reviewCheckin,
  saveCheckinSettings,
  type Checkin,
  type CheckinSettings,
} from "@/lib/checkins/api";
import { formatLongDate } from "@/lib/format/date";

type Choice = "off" | "7" | "14";

const choiceOf = (s: CheckinSettings | null): Choice => (s?.interval_days === 7 ? "7" : s?.interval_days === 14 ? "14" : "off");

/**
 * Phase 2, A7: the periodic check-in on the patient's profile: how often the
 * patient gets the short questionnaire (off / weekly / every two weeks), the
 * next due date (also written out, since a date field is easy to misread), and
 * what they answered, newest first. An answer that needs attention is badged
 * and has a «تمت المراجعة» button, which also closes its alert.
 */
export function CheckinCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("checkinCard");
  const locale = useLocale();
  const format = useFormatter();
  const { authorizedFetch } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [settings, setSettings] = useState<CheckinSettings | null>(null);
  const [history, setHistory] = useState<Checkin[]>([]);
  const [choice, setChoice] = useState<Choice>("off");
  const [due, setDue] = useState("");
  const [dueTouched, setDueTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback((s: CheckinSettings | null) => {
    setSettings(s);
    setChoice(choiceOf(s));
    setDue(s?.next_due_on ?? "");
    setDueTouched(false);
  }, []);

  const loadHistory = useCallback(async () => {
    const r = await listCheckins(authorizedFetch, subscriberId);
    if (r.ok) setHistory(r.data);
  }, [authorizedFetch, subscriberId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCheckinSettings(authorizedFetch, subscriberId), listCheckins(authorizedFetch, subscriberId)]).then(([s, h]) => {
      if (cancelled) return;
      if (s.ok) apply(s.data);
      else setFailed(true);
      if (h.ok) setHistory(h.data);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId, apply]);

  if (!loaded) return null;
  if (failed) return <p className="text-sm text-danger">{t("loadFailed")}</p>;

  const dateTime = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" });

  async function save() {
    setBusy(true);
    setMessage(null);

    if (choice === "off") {
      const ok = settings === null ? true : await removeCheckinSettings(authorizedFetch, subscriberId);
      setBusy(false);
      if (!ok) return setMessage({ ok: false, text: t("saveFailed") });
      apply(null);
      return setMessage({ ok: true, text: t("savedOff") });
    }

    const r = await saveCheckinSettings(authorizedFetch, subscriberId, {
      interval_days: choice === "7" ? 7 : 14,
      // Only a date she changed is sent; otherwise it starts today.
      ...(dueTouched && due ? { next_due_on: due } : {}),
    });
    setBusy(false);

    if (!r.ok) return setMessage({ ok: false, text: r.error.errors?.next_due_on?.[0] ?? r.error.errors?.interval_days?.[0] ?? t("saveFailed") });

    apply(r.data);
    setMessage({ ok: true, text: t("saved") });
    // A due date of today opens the first questionnaire at once.
    await loadHistory();
  }

  async function review(id: number) {
    const r = await reviewCheckin(authorizedFetch, subscriberId, id);
    if (r.ok) setHistory((list) => list.map((c) => (c.id === id ? { ...c, ...r.data } : c)));
  }

  const changed = choice !== choiceOf(settings) || (choice !== "off" && dueTouched);

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <ClipboardList size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("helper")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="checkin-interval" className="text-sm font-semibold text-ink">
            {t("interval")}
          </label>
          <select
            id="checkin-interval"
            value={choice}
            disabled={readOnly}
            onChange={(e) => setChoice(e.target.value as Choice)}
            className="h-11 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          >
            <option value="off">{t("off")}</option>
            <option value="7">{t("weekly")}</option>
            <option value="14">{t("biweekly")}</option>
          </select>
        </div>

        {choice !== "off" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-due" className="text-sm font-semibold text-ink">
              {t("nextDue")}
            </label>
            <input
              id="checkin-due"
              type="date"
              value={due}
              disabled={readOnly}
              onChange={(e) => {
                setDue(e.target.value);
                setDueTouched(true);
              }}
              className="h-11 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm tabular-nums text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />
            <p className="text-xs font-semibold text-ink">{due ? formatLongDate(due, locale) : t("startsToday")}</p>
          </div>
        )}
      </div>

      {message && (
        <p role={message.ok ? "status" : "alert"} className={`rounded-field px-3.5 py-2.5 text-sm ${message.ok ? "bg-status-on-track-bg text-status-on-track" : "bg-status-late-bg text-status-late"}`}>
          {message.text}
        </p>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={save} isLoading={busy} disabled={!changed}>
            {t("save")}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-divider pt-4">
        <h3 className="text-sm font-bold text-ink">{t("history")}</h3>
        {history.length === 0 && <p className="text-sm text-ink-muted">{t("empty")}</p>}

        {history.map((c) => (
          <article key={c.id} className={`flex flex-col gap-2 rounded-field border p-3 ${c.flagged && !c.reviewed_at ? "border-status-late/40 bg-status-late-bg/40" : "border-border/70"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{formatLongDate(c.due_on, locale)}</span>
              <Badge tone={c.status === "submitted" ? "success" : c.status === "pending" ? "warning" : "neutral"}>{t(`status.${c.status}`)}</Badge>
              {c.flagged && <Badge tone="danger">{t("needsAttention")}</Badge>}
              {c.flagged && c.reviewed_at && <Badge tone="neutral">{t("reviewed")}</Badge>}
              {c.submitted_at && <span className="ms-auto text-xs text-ink-muted">{dateTime(c.submitted_at)}</span>}
            </div>

            {c.answers_display.length > 0 && (
              <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
                {c.answers_display.map((line) => (
                  <div key={line.key} className="contents">
                    <dt className="text-xs text-ink-muted sm:text-sm">{line.label}</dt>
                    <dd className={line.flagged ? "font-semibold text-status-late" : "text-ink"}>{line.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {c.flagged && !c.reviewed_at && !readOnly && (
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => review(c.id)}>
                  {t("markReviewed")}
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
