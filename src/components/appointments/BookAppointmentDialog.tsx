"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import { bookAppointment, getNewBookingSlots, type Appointment, type AppointmentType, type SlotsResponse } from "@/lib/appointments/api";

const TYPES: AppointmentType[] = ["follow_up", "results_review", "quick_consult"];
const CHANNELS: Appointment["channel"][] = ["whatsapp", "phone", "video"];
const TOPICS = ["weight", "meals", "plan_change", "results", "medications", "other"];

type Patient = { id: number | string; name: string };

/**
 * «حجز موعد» (nutritionist): book a new appointment for a patient directly,
 * instead of waiting on the patient's own app (e.g. after a phone call). No
 * 12-hour lead for the nutritionist. Mirrors RescheduleDialog's day/time
 * picker, with a type/channel/topics/note form and, when no patient is
 * preselected, a search step first. The caller should remount this on
 * every open (e.g. `key={open ? "open" : "closed"}`) so state starts fresh.
 */
export function BookAppointmentDialog({
  open,
  subscriber,
  onClose,
  onDone,
}: {
  open: boolean;
  /** Preselected patient (patient page); null shows a search step first (appointments page). */
  subscriber: Patient | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("appointments.book");
  const tShared = useTranslations("appointments");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [picked, setPicked] = useState<Patient | null>(subscriber);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);

  const [type, setType] = useState<AppointmentType | "">("");
  const [channel, setChannel] = useState<Appointment["channel"] | "">("");
  const [topics, setTopics] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (picked || query.trim().length === 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      listClients(authorizedFetch, { search: query.trim() }).then((r) => {
        if (!cancelled && r.ok) setResults(r.data.data.slice(0, 8));
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, picked, authorizedFetch]);

  useEffect(() => {
    if (!picked || !type) return;
    let cancelled = false;
    getNewBookingSlots(authorizedFetch, picked.id, type).then((r) => {
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
  }, [picked, type, authorizedFetch, t]);

  function resetToPatientSearch() {
    setPicked(null);
    setType("");
    setChannel("");
    setTopics([]);
    setNote("");
    setError(null);
  }

  const dayFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { weekday: "short", day: "numeric", month: "short" });
  const timeFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: slots?.timezone });
  const times = slots?.days.find((d) => d.date === day)?.times ?? [];

  function toggleTopic(x: string) {
    setTopics((prev) => (prev.includes(x) ? prev.filter((y) => y !== x) : [...prev, x]));
  }

  async function confirm() {
    if (!picked || !type || !channel || !time) return;
    setBusy(true);
    setError(null);
    const r = await bookAppointment(authorizedFetch, picked.id, {
      type,
      starts_at: time,
      channel,
      topics: topics.length > 0 ? topics : undefined,
      note: note.trim() || null,
    });
    setBusy(false);
    if (!r.ok) {
      const code = (r.error as { code?: string }).code;
      const byCode: Record<string, string> = {
        slot_unavailable: t("taken"),
        appointment_exists: t("exists"),
        video_unavailable: t("videoUnavailable"),
        follow_up_ended: t("followUpEnded"),
      };
      setError((code && byCode[code]) || t("failed"));
      return;
    }
    onDone();
  }

  return (
    <Dialog open={open} onClose={onClose} title={t("title")} busy={busy} size="lg">
      <div className="flex flex-col gap-4">
        {!picked && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">{t("patientLabel")}</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-field border border-border bg-canvas/60 px-3.5 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
            {query.trim().length > 0 && (
              <ul className="max-h-48 overflow-y-auto rounded-field border border-border/70">
                {results.length === 0 && <li className="px-3.5 py-2.5 text-sm text-ink-muted">{t("noResults")}</li>}
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPicked({ id: c.id, name: c.name });
                        setQuery("");
                        setResults([]);
                      }}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-start text-sm text-ink hover:bg-canvas"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-ink-muted" dir="ltr">{c.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {picked && (
          <div className="flex items-center justify-between rounded-field border border-border/70 bg-canvas/60 px-3.5 py-2.5">
            <span className="text-sm font-semibold text-ink">{picked.name}</span>
            {subscriber === null && (
              <button type="button" onClick={resetToPatientSearch} className="text-xs font-semibold text-primary hover:underline">
                {t("changePatient")}
              </button>
            )}
          </div>
        )}

        {picked && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label={t("typeLabel")} value={type} onChange={(e) => setType(e.target.value as AppointmentType)}>
                <option value="" disabled>
                  …
                </option>
                {TYPES.map((x) => (
                  <option key={x} value={x}>
                    {tShared(`type.${x}`)}
                  </option>
                ))}
              </Select>
              <Select label={t("channelLabel")} value={channel} onChange={(e) => setChannel(e.target.value as Appointment["channel"])}>
                <option value="" disabled>
                  …
                </option>
                {CHANNELS.map((x) => (
                  <option key={x} value={x} disabled={x === "video" && slots !== null && !slots.video_available}>
                    {tShared(`channel.${x}`)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">{t("topicsLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => toggleTopic(x)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${topics.includes(x) ? "border-primary bg-primary/10 text-primary" : "border-border text-ink-muted hover:text-ink"}`}
                  >
                    {tShared(`topic.${x}`)}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              {t("noteLabel")}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2} className="rounded-field border border-border bg-card p-3 text-sm font-normal outline-none focus:border-primary" />
            </label>

            {type && !slots && !error && <p className="text-sm text-ink-muted">…</p>}
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
          <Button onClick={confirm} isLoading={busy} disabled={!picked || !type || !channel || !time}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
