"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HeartPulse, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { addCondition, getConditions, removeCondition, updateCondition, type Condition, type ConditionOption } from "@/lib/conditions/api";

const section = "rounded-panel border border-border/70 bg-card p-5 shadow-panel";

/**
 * Clinical batch 1, C5: the patient's medical conditions as structured
 * records. A tick adds or removes one at once; "other" takes free text. Each
 * condition may carry a short note, saved when the field loses focus.
 *
 * Nutritionist only. The old free-text list is mirrored from these records
 * by the server, so the AI draft and the patient app keep reading it.
 */
export function ConditionsCard({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("conditionsCard");
  const { authorizedFetch } = useAuth();

  const [items, setItems] = useState<Condition[] | null>(null);
  const [options, setOptions] = useState<ConditionOption[]>([]);
  const [otherText, setOtherText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const r = await getConditions(authorizedFetch, subscriberId);
    if (!r.ok) {
      setError(t("loadFailed"));
      return;
    }
    setItems(r.data.data);
    setOptions(r.data.available);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriberId]);

  async function run(action: () => Promise<{ ok: boolean; error?: { message: string } } | boolean>) {
    setBusy(true);
    setError(null);
    const result = await action();
    const failed = typeof result === "boolean" ? !result : !result.ok;
    if (failed) setError(typeof result === "boolean" ? t("saveFailed") : (result.error?.message ?? t("saveFailed")));
    await reload();
    setBusy(false);
  }

  if (items === null) return error ? <p className="text-sm text-danger">{error}</p> : null;

  const byCode = new Map(items.filter((c) => c.code !== "other").map((c) => [c.code, c]));
  const others = items.filter((c) => c.code === "other");

  function toggle(code: string) {
    const existing = byCode.get(code);
    return run(() => (existing ? removeCondition(authorizedFetch, subscriberId, existing.id) : addCondition(authorizedFetch, subscriberId, { code })));
  }

  function addOther() {
    const text = otherText.trim();
    if (!text) return;
    setOtherText("");
    return run(() => addCondition(authorizedFetch, subscriberId, { code: "other", other_text: text }));
  }

  function saveNote(c: Condition, note: string) {
    if ((c.note ?? "") === note.trim()) return;
    return run(() => updateCondition(authorizedFetch, subscriberId, c.id, { code: c.code, other_text: c.other_text, note: note.trim() || null }));
  }

  const note = (c: Condition) => (
    <input
      key={`note-${c.id}`}
      defaultValue={c.note ?? ""}
      maxLength={300}
      disabled={busy}
      placeholder={t("notePlaceholder")}
      aria-label={t("noteFor", { name: c.label })}
      onBlur={(e) => saveNote(c, e.target.value)}
      className="h-10 w-full rounded-field border border-border bg-canvas/60 px-3 text-sm text-ink outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
    />
  );

  return (
    <section className={`${section} flex flex-col gap-4`}>
      <div className="flex items-start gap-2">
        <HeartPulse size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("helper")}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options
          .filter((o) => o.code !== "other")
          .map((o) => (
            <label key={o.code} className="flex items-center gap-2.5 rounded-field border border-border bg-canvas/40 px-3 py-2.5 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={byCode.has(o.code)}
                disabled={busy}
                onChange={() => toggle(o.code)}
                className="h-4 w-4 shrink-0 accent-[var(--color-primary)]"
              />
              {o.label}
            </label>
          ))}
      </div>

      {Array.from(byCode.values()).length > 0 && (
        <div className="flex flex-col gap-2">
          {Array.from(byCode.values()).map((c) => (
            <div key={c.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm font-semibold text-ink sm:w-44">{c.label}</span>
              {note(c)}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-divider pt-4">
        <p className="text-sm font-semibold text-ink">{t("other")}</p>
        {others.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink sm:w-44">
              {c.label}
              <button type="button" disabled={busy} onClick={() => run(() => removeCondition(authorizedFetch, subscriberId, c.id))} aria-label={t("remove", { name: c.label })} className="text-ink-muted hover:text-danger">
                <X size={14} />
              </button>
            </span>
            {note(c)}
          </div>
        ))}
        <div className="flex gap-2">
          <input
            value={otherText}
            maxLength={100}
            disabled={busy}
            onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOther();
              }
            }}
            placeholder={t("otherPlaceholder")}
            className="h-10 min-w-0 flex-1 rounded-field border border-border bg-canvas/60 px-3 text-sm text-ink outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
          <Button variant="secondary" disabled={busy || otherText.trim() === ""} onClick={addOther}>
            {t("add")}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}
    </section>
  );
}
