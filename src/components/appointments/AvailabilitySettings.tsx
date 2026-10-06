"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCog, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { getAvailability, saveAvailability, type AvailabilityWindow } from "@/lib/appointments/api";

const QUARTERS = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

/** Weekly windows (15-minute steps), days off and a default meeting link. */
export function AvailabilitySettings() {
  const t = useTranslations("appointments.availability");
  const { authorizedFetch } = useAuth();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [newDayOff, setNewDayOff] = useState("");
  const [link, setLink] = useState("");
  const [tz, setTz] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getAvailability(authorizedFetch).then((r) => {
      if (!r.ok) return;
      setWindows(r.data.windows);
      setDaysOff(r.data.days_off);
      setLink(r.data.meeting_link ?? "");
      setTz(r.data.timezone);
    });
  }, [authorizedFetch]);

  async function save() {
    setSaving(true);
    const r = await saveAvailability(authorizedFetch, { windows, days_off: daysOff, meeting_link: link.trim() || null });
    setSaving(false);
    setMessage(r.ok ? { ok: true, text: t("saved") } : { ok: false, text: r.error.errors?.meeting_link ? t("badLink") : (r.error as { code?: string }).code === "window_invalid" ? t("badWindow") : t("saveFailed") });
  }

  const select = "h-10 rounded-field border border-border bg-card px-2 text-sm text-ink outline-none focus:border-primary";

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <CalendarCog size={18} className="text-primary" aria-hidden="true" />
          {t("title")}
        </h2>
        <p className="text-xs text-ink-muted">{t("hint", { tz })}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {windows.map((w, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <select aria-label={t("day")} className={select} value={w.weekday} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, weekday: Number(e.target.value) } : x)))}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {t(`weekday.${d}`)}
                </option>
              ))}
            </select>
            <select aria-label={t("from")} className={select} value={w.start} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}>
              {QUARTERS.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
            <span className="text-sm text-ink-muted">–</span>
            <select aria-label={t("to")} className={select} value={w.end} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}>
              {QUARTERS.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
            <button type="button" aria-label={t("remove")} onClick={() => setWindows(windows.filter((_, j) => j !== i))} className="text-ink-muted hover:text-status-late">
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setWindows([...windows, { weekday: 0, start: "09:00", end: "13:00" }])} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <Plus size={15} /> {t("addWindow")}
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t("daysOff")}</span>
        <div className="flex flex-wrap gap-2">
          {daysOff.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded-full bg-canvas px-3 py-1 text-xs text-ink" dir="ltr">
              {d}
              <button type="button" aria-label={t("remove")} onClick={() => setDaysOff(daysOff.filter((x) => x !== d))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <TextField label={t("addDayOff")} type="date" value={newDayOff} onChange={(e) => setNewDayOff(e.target.value)} />
          <Button variant="secondary" onClick={() => newDayOff && !daysOff.includes(newDayOff) && (setDaysOff([...daysOff, newDayOff].sort()), setNewDayOff(""))}>
            {t("add")}
          </Button>
        </div>
      </div>

      <TextField label={t("meetingLink")} dir="ltr" placeholder="https://meet.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} hint={t("meetingLinkHint")} />

      {message && <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-status-on-track" : "text-status-late"}`}>{message.text}</p>}
      <Button onClick={save} isLoading={saving} className="w-fit">
        {t("save")}
      </Button>
    </section>
  );
}
