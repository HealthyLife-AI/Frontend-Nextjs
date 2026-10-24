"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ruler } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  SCHEDULE_MAX_DAYS,
  SCHEDULE_MIN_DAYS,
  SCHEDULE_PRESETS,
  getMeasurementSchedule,
  removeMeasurementSchedule,
  saveMeasurementSchedule,
  type MeasurementSchedule,
} from "@/lib/measurementSchedule/api";

type Choice = "7" | "14" | "30" | "custom";

const choiceFor = (days: number): Choice => ((SCHEDULE_PRESETS as readonly number[]).includes(days) ? (String(days) as Choice) : "custom");

/**
 * Phase 1, B6: how often this patient records body measurements, the next
 * due date, and a "متأخر" badge when it has passed. Saving sets the schedule;
 * the patient gets a generic reminder on the day and the nutritionist an
 * alert 3 days after it. A reading recorded by either of them moves the date.
 */
export function MeasurementScheduleCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("measurementSchedule");
  const { authorizedFetch } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [schedule, setSchedule] = useState<MeasurementSchedule | null>(null);
  const [choice, setChoice] = useState<Choice>("14");
  const [custom, setCustom] = useState("");
  const [due, setDue] = useState("");
  const [dueTouched, setDueTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback((s: MeasurementSchedule | null) => {
    setSchedule(s);
    setDueTouched(false);
    if (s) {
      setChoice(choiceFor(s.interval_days));
      setCustom(choiceFor(s.interval_days) === "custom" ? String(s.interval_days) : "");
      setDue(s.next_due_on);
    } else {
      setDue("");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMeasurementSchedule(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) apply(r.data);
      else setFailed(true);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId, apply]);

  if (!loaded) return null;
  if (failed) return <p className="text-sm text-danger">{t("loadFailed")}</p>;

  const days = choice === "custom" ? Number(custom) : Number(choice);
  const valid = Number.isInteger(days) && days >= SCHEDULE_MIN_DAYS && days <= SCHEDULE_MAX_DAYS;

  async function save() {
    setBusy(true);
    setMessage(null);
    const r = await saveMeasurementSchedule(authorizedFetch, subscriberId, {
      interval_days: days,
      // Only a date she changed is sent; otherwise the server counts from today.
      ...(dueTouched && due ? { next_due_on: due } : {}),
    });
    setBusy(false);

    if (!r.ok) {
      setMessage({ ok: false, text: r.error.errors?.next_due_on?.[0] ?? r.error.errors?.interval_days?.[0] ?? t("saveFailed") });
      return;
    }

    apply(r.data);
    setMessage({ ok: true, text: t("saved") });
  }

  async function remove() {
    setBusy(true);
    setMessage(null);
    const ok = await removeMeasurementSchedule(authorizedFetch, subscriberId);
    setBusy(false);

    if (!ok) {
      setMessage({ ok: false, text: t("saveFailed") });
      return;
    }

    apply(null);
    setMessage({ ok: true, text: t("removed") });
  }

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Ruler size={18} className="mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-ink">{t("title")}</h2>
            <p className="text-sm text-ink-muted">{t("helper")}</p>
          </div>
        </div>
        {schedule?.is_overdue && <Badge tone="danger">{schedule.days_overdue > 0 ? t("overdueDays", { days: schedule.days_overdue }) : t("overdue")}</Badge>}
      </div>

      {!schedule && <p className="text-sm text-ink-muted">{t("none")}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="schedule-interval" className="text-sm font-semibold text-ink">
            {t("interval")}
          </label>
          <select
            id="schedule-interval"
            value={choice}
            disabled={readOnly}
            onChange={(e) => setChoice(e.target.value as Choice)}
            className="h-11 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          >
            <option value="7">{t("week")}</option>
            <option value="14">{t("twoWeeks")}</option>
            <option value="30">{t("month")}</option>
            <option value="custom">{t("custom")}</option>
          </select>
          {choice === "custom" && (
            <input
              type="number"
              min={SCHEDULE_MIN_DAYS}
              max={SCHEDULE_MAX_DAYS}
              value={custom}
              disabled={readOnly}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t("customDays")}
              aria-label={t("customDays")}
              aria-invalid={custom !== "" && !valid}
              className="h-11 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm tabular-nums text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="schedule-due" className="text-sm font-semibold text-ink">
            {t("nextDue")}
          </label>
          <input
            id="schedule-due"
            type="date"
            value={due}
            disabled={readOnly}
            onChange={(e) => {
              setDue(e.target.value);
              setDueTouched(true);
            }}
            className="h-11 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm tabular-nums text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
          <p className="text-xs text-ink-muted">{t("dateHint")}</p>
        </div>
      </div>

      {message && (
        <p role={message.ok ? "status" : "alert"} className={`rounded-field px-3.5 py-2.5 text-sm ${message.ok ? "bg-status-on-track-bg text-status-on-track" : "bg-status-late-bg text-status-late"}`}>
          {message.text}
        </p>
      )}

      {!readOnly && (
        <div className="flex flex-wrap justify-end gap-2">
          {schedule && (
            <Button variant="ghost" onClick={remove} disabled={busy}>
              {t("remove")}
            </Button>
          )}
          <Button onClick={save} isLoading={busy} disabled={!valid}>
            {t("save")}
          </Button>
        </div>
      )}
    </section>
  );
}
