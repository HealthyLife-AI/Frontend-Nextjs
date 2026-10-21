"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BellRing, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  ALERT_SETTING_BOUNDS,
  ALERT_SETTING_FIELDS,
  getAlertSettings,
  saveAlertSettings,
  type AlertSettingField,
  type AlertSettings,
} from "@/lib/alertSettings/api";

type Draft = Record<AlertSettingField, string>;

const UNIT: Record<AlertSettingField, "days" | "kg"> = {
  no_log_days: "days",
  calorie_exceeded_streak_days: "days",
  milestone_weight_change_kg: "kg",
  milestone_window_days: "days",
};

const blank = (): Draft => ({ no_log_days: "", calorie_exceeded_streak_days: "", milestone_weight_change_kg: "", milestone_window_days: "" });

/**
 * Pilot feedback 2, B5: this patient's own alert thresholds.
 *
 * Every field shows the global default as its placeholder; an empty field
 * means "use the default" and is sent as null, which is also what the
 * per-field «افتراضي» button does. A diabetic patient who must log every
 * day wants a 1-day no-log alert; a stable maintenance patient is fine at 5.
 *
 * Saving re-checks this one patient on the server at once, so alerts that no
 * longer hold are resolved and ones that now do are opened without waiting
 * for tomorrow morning.
 */
export function AlertSettingsCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("alertSettings");
  const { authorizedFetch } = useAuth();

  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [draft, setDraft] = useState<Draft>(blank());
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback((s: AlertSettings) => {
    setSettings(s);
    setDraft(Object.fromEntries(ALERT_SETTING_FIELDS.map((f) => [f, s.overrides[f] === null ? "" : String(s.overrides[f])])) as Draft);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getAlertSettings(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) apply(r.data);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [authorizedFetch, subscriberId, apply]);

  if (failed) return null;
  if (!settings) return null;

  /** What each field would be sent as: the number, or null for "use the default". */
  const payload = () =>
    Object.fromEntries(ALERT_SETTING_FIELDS.map((f) => [f, draft[f].trim() === "" ? null : Number(draft[f])])) as Record<AlertSettingField, number | null>;

  const outOfRange = (f: AlertSettingField) => {
    if (draft[f].trim() === "") return false;
    const n = Number(draft[f]);
    const b = ALERT_SETTING_BOUNDS[f];
    return !Number.isFinite(n) || n < b.min || n > b.max;
  };

  const dirty = ALERT_SETTING_FIELDS.some((f) => (draft[f].trim() === "" ? null : Number(draft[f])) !== settings.overrides[f]);
  const invalid = ALERT_SETTING_FIELDS.some(outOfRange);

  async function save() {
    setError(null);
    setSaving(true);
    const result = await saveAlertSettings(authorizedFetch, subscriberId, payload());
    setSaving(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    apply(result.data);
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 4000);
  }

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <BellRing size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("helper")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ALERT_SETTING_FIELDS.map((field) => {
          const bounds = ALERT_SETTING_BOUNDS[field];
          const bad = outOfRange(field);
          const isOverridden = draft[field].trim() !== "";

          return (
            <div key={field} className="flex flex-col gap-1.5">
              <label htmlFor={`alert-${field}`} className="text-sm font-semibold text-ink">
                {t(`field.${field}`)}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`alert-${field}`}
                  type="number"
                  inputMode="decimal"
                  min={bounds.min}
                  max={bounds.max}
                  step={bounds.step}
                  disabled={readOnly}
                  value={draft[field]}
                  placeholder={String(settings.defaults[field])}
                  onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                  aria-invalid={bad}
                  className={`h-11 w-full min-w-0 rounded-field border bg-canvas/60 px-3 text-sm tabular-nums text-ink outline-none transition-all focus:bg-card focus:ring-4 ${
                    bad ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border hover:border-primary/30 focus:border-primary focus:ring-primary/10"
                  } disabled:opacity-60`}
                />
                <span className="shrink-0 text-sm text-ink-muted">{t(`unit.${UNIT[field]}`)}</span>
                <button
                  type="button"
                  disabled={readOnly || !isOverridden}
                  onClick={() => setDraft((d) => ({ ...d, [field]: "" }))}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline disabled:cursor-default disabled:text-ink-muted/50 disabled:no-underline"
                >
                  {t("default")}
                </button>
              </div>
              <p className={`text-xs ${bad ? "text-danger" : "text-ink-muted"}`}>
                {bad
                  ? t("range", { min: bounds.min, max: bounds.max })
                  : isOverridden
                    ? t("defaultIs", { value: settings.defaults[field] })
                    : t("usingDefault", { value: settings.defaults[field] })}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted">{t("example")}</p>

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {toast && (
          <span role="status" className="inline-flex items-center gap-1.5 rounded-full bg-status-on-track-bg px-3 py-1.5 text-sm font-medium text-status-on-track">
            <Check size={15} aria-hidden="true" />
            {t("saved")}
          </span>
        )}
        <Button onClick={save} isLoading={saving} disabled={readOnly || !dirty || invalid}>
          {t("save")}
        </Button>
      </div>
    </section>
  );
}
