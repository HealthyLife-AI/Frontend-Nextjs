import { Check, CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export type CompletionItem = { key: string; label: string; done: boolean; fieldId: string };

/**
 * «اكتمال الملف»: the six patient-facing fields as a checklist with a
 * progress bar. Each missing one has an «إضافة» link that scrolls to its
 * field and focuses it. Collapses to one line once everything is filled.
 */
export function ProfileCompletion({ items }: { items: CompletionItem[] }) {
  const t = useTranslations("settings.completion");
  const done = items.filter((i) => i.done).length;
  const total = items.length;

  function focusField(fieldId: string) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    field.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    field.focus({ preventScroll: true });
  }

  if (done === total) {
    return (
      <section className="flex min-h-[52px] items-center gap-2.5 rounded-panel border border-border/70 bg-card px-5 shadow-panel">
        <CircleCheck size={20} strokeWidth={2} className="text-status-on-track-ink" aria-hidden="true" />
        <h2 className="text-sm font-extrabold text-ink">{t("done")}</h2>
      </section>
    );
  }

  return (
    <section aria-labelledby="completion-title" className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="completion-title" className="text-base font-extrabold text-ink">
          {t("title")}
        </h2>
        <span className="text-sm font-bold tabular-nums text-ink-muted">{t("count", { done, total })}</span>
      </div>

      <div role="img" aria-label={t("barLabel", { done, total })} className="mt-3 h-2 overflow-hidden rounded-full bg-divider">
        <div className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <ul className="mt-3 flex flex-col">
        {items.map((item) => (
          <li key={item.key} className="flex min-h-11 items-center gap-2.5 text-sm">
            {item.done ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-on-track-bg text-status-on-track-ink">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>
            ) : (
              <span className="h-5 w-5 shrink-0 rounded-full border-2 border-border" aria-hidden="true" />
            )}
            <span className={`flex-1 ${item.done ? "text-ink" : "text-ink-muted"}`}>{item.label}</span>
            {!item.done && (
              <button
                type="button"
                onClick={() => focusField(item.fieldId)}
                aria-label={t("addField", { field: item.label })}
                className="min-h-10 rounded-field px-2.5 text-sm font-bold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {t("add")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
