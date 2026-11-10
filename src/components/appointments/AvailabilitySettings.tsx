"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { formatLongDate } from "@/lib/format/date";
import { getAvailability, saveAvailability, type AvailabilityWindow } from "@/lib/appointments/api";

const QUARTERS = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

/**
 * Weekly windows (15-minute steps), days off and a default meeting link.
 * Laid out as a settings-page section (#availability): the windows as one
 * bordered list of rows, then days off and the meeting link side by side.
 * Load, edit and save logic unchanged.
 */
export function AvailabilitySettings() {
  const t = useTranslations("appointments.availability");
  const locale = useLocale();
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

  const field =
    "min-h-[46px] rounded-field border border-border bg-card px-3 text-sm text-ink outline-none transition-colors hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10";
  const addDayOff = () => newDayOff && !daysOff.includes(newDayOff) && (setDaysOff([...daysOff, newDayOff].sort()), setNewDayOff(""));

  return (
    <SettingsSection
      id="availability"
      icon={CalendarClock}
      title={t("title")}
      description={t("hint", { tz })}
      footerStatus={message && <p role={message.ok ? "status" : "alert"} className={`font-semibold ${message.ok ? "text-status-on-track-ink" : "text-status-late-ink"}`}>{message.text}</p>}
      footerAction={
        <Button onClick={save} isLoading={saving}>
          {t("save")}
        </Button>
      }
    >
      <h3 className="mb-2 text-sm font-bold text-ink">{t("windowsTitle")}</h3>
      <ul className="divide-y divide-divider rounded-[14px] border border-border">
        {windows.map((w, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
            <select aria-label={t("day")} className={`${field} min-w-[8rem] flex-1 font-bold`} value={w.weekday} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, weekday: Number(e.target.value) } : x)))}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {t(`weekday.${d}`)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              {t("from")}
              <select className={`${field} tabular-nums`} value={w.start} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}>
                {QUARTERS.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              {t("to")}
              <select className={`${field} tabular-nums`} value={w.end} onChange={(e) => setWindows(windows.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}>
                {QUARTERS.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-label={t("remove")}
              title={t("remove")}
              onClick={() => setWindows(windows.filter((_, j) => j !== i))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field text-ink-muted transition-colors hover:bg-status-late-bg hover:text-status-late-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </li>
        ))}
        <li className="px-1.5 py-1">
          <button
            type="button"
            onClick={() => setWindows([...windows, { weekday: 0, start: "09:00", end: "13:00" }])}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-field px-2.5 text-sm font-bold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Plus size={17} strokeWidth={2} aria-hidden="true" /> {t("addWindow")}
          </button>
        </li>
      </ul>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-x-6 gap-y-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-ink">{t("daysOff")}</h3>
          {daysOff.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {daysOff.map((d) => (
                <li key={d} className="inline-flex min-h-11 items-center rounded-full bg-canvas ps-3.5 text-sm font-semibold text-ink ring-1 ring-border">
                  {formatLongDate(d, locale)}
                  <button
                    type="button"
                    aria-label={t("remove")}
                    title={t("remove")}
                    onClick={() => setDaysOff(daysOff.filter((x) => x !== d))}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-status-late-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <X size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <input type="date" aria-label={t("addDayOff")} value={newDayOff} onChange={(e) => setNewDayOff(e.target.value)} className={`${field} min-w-0 flex-1`} />
            <Button type="button" variant="secondary" onClick={addDayOff}>
              {t("add")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="meeting-link" className="text-sm font-bold text-ink">
            {t("meetingLink")}
          </label>
          <input
            id="meeting-link"
            dir="ltr"
            placeholder="https://meet.google.com/…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            aria-describedby={link.trim() ? undefined : "meeting-link-hint"}
            className={field}
          />
          {/* Only a warning while it matters: without a link, video bookings are off. */}
          {!link.trim() && (
            <p id="meeting-link-hint" className="text-[13px] font-semibold text-status-attention-ink">
              {t("meetingLinkHint")}
            </p>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
