"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { getRescheduleSlots, rescheduleAppointment, type Appointment, type SlotsResponse } from "@/lib/appointments/api";

/**
 * «تغيير الموعد» (nutritionist): pick a day, then one of the free times the
 * server offers (availability and other bookings respected; only the
 * patient's 12-hour rule is waived). The patient is notified once.
 */
export function RescheduleDialog({ appointment, onClose, onDone }: { appointment: Appointment | null; onClose: () => void; onDone: () => void }) {
  const t = useTranslations("appointments.reschedule");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const id = appointment?.id;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getRescheduleSlots(authorizedFetch, id).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setSlots(r.data);
        setDay(r.data.days[0]?.date ?? null);
        setError(null);
      } else setError(t("loadFailed"));
    });
    return () => {
      cancelled = true;
      setSlots(null);
      setDay(null);
      setTime(null);
    };
  }, [id, authorizedFetch, t]);

  const dayFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { weekday: "short", day: "numeric", month: "short" });
  const timeFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: slots?.timezone });
  const times = slots?.days.find((d) => d.date === day)?.times ?? [];

  async function confirm() {
    if (!id || !time) return;
    setBusy(true);
    setError(null);
    const r = await rescheduleAppointment(authorizedFetch, id, time);
    setBusy(false);
    if (!r.ok) {
      setError((r.error as { code?: string }).code === "slot_unavailable" || r.status === 409 ? t("taken") : t("failed"));
      return;
    }
    onDone();
  }

  return (
    <Dialog open={appointment !== null} onClose={onClose} title={t("title")} busy={busy}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{t("body")}</p>
        {!slots && !error && <p className="text-sm text-ink-muted">…</p>}
        {slots && slots.days.length === 0 && <p className="text-sm text-ink-muted">{t("none")}</p>}
        {slots && slots.days.length > 0 && (
          <>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto" role="group" aria-label={t("day")}>
              {slots.days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setDay(d.date);
                    setTime(null);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${d.date === day ? "border-primary bg-primary/10 text-primary" : "border-border text-ink-muted hover:text-ink"}`}
                >
                  {dayFmt.format(new Date(`${d.date}T12:00:00`))}
                </button>
              ))}
            </div>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto" role="group" aria-label={t("time")}>
              {times.map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setTime(x)}
                  dir="ltr"
                  className={`rounded-field border px-3 py-1.5 text-sm font-semibold tabular-nums ${x === time ? "border-primary bg-primary text-white" : "border-border text-ink hover:border-primary/40"}`}
                >
                  {timeFmt.format(new Date(x))}
                </button>
              ))}
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-status-late">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button onClick={confirm} isLoading={busy} disabled={!time}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
