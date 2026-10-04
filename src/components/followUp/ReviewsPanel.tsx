"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Circle, MessageSquareText, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import {
  MAX_NOTE_LENGTH,
  REVIEW_RATINGS,
  createReview,
  deleteReview,
  listReviews,
  updateReview,
  type Review,
  type ReviewInput,
  type ReviewRating,
} from "@/lib/followUp/api";

const RATING_TONE: Record<ReviewRating, "success" | "warning" | "primary"> = {
  on_track: "success",
  small_adjustment: "warning",
  review_together: "primary",
};

type Draft = { rating: ReviewRating | ""; note: string; keyPoints: string[]; tasks: { id?: number; title: string }[] };

const EMPTY: Draft = { rating: "", note: "", keyPoints: [""], tasks: [{ title: "" }] };

function toDraft(review: Review): Draft {
  return {
    rating: review.rating ?? "",
    note: review.note ?? "",
    keyPoints: review.key_points.length ? [...review.key_points] : [""],
    tasks: review.tasks.length ? review.tasks.map((t) => ({ id: t.id, title: t.title })) : [{ title: "" }],
  };
}

function toInput(draft: Draft): ReviewInput {
  return {
    rating: draft.rating || null,
    note: draft.note.trim() || null,
    key_points: draft.keyPoints.map((p) => p.trim()).filter(Boolean),
    tasks: draft.tasks.filter((t) => t.title.trim()).map((t) => ({ ...(t.id ? { id: t.id } : {}), title: t.title.trim() })),
  };
}

/**
 * «المتابعة بين الجلسات»: what the nutritionist writes for the patient
 * between sessions — a three-state rating, a note, key points, tasks — and
 * what the patient did with it («فهمت», ticked tasks). Writing is off while
 * follow-up has ended (the API refuses it with 409 anyway).
 */
export function ReviewsPanel({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("followUp.reviews");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);

  useEffect(() => {
    let cancelled = false;
    listReviews(authorizedFetch, subscriberId)
      .then((r) => {
        if (cancelled) return;
        setFailed(!r.ok);
        if (r.ok) setReviews(r.data);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  const dateFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const input = toInput(editing.draft);
    const result = editing.id === null
      ? await createReview(authorizedFetch, subscriberId, input)
      : await updateReview(authorizedFetch, subscriberId, editing.id, input);
    setSaving(false);

    if (!result.ok) {
      const code = (result.error as { code?: string }).code;
      setError(code === "review_empty" ? t("errorEmpty") : code === "follow_up_ended" ? t("errorEnded") : result.error.errors?.note ? t("errorNoteLength", { max: MAX_NOTE_LENGTH }) : t("errorSave"));
      return;
    }

    setReviews((current) => {
      const rest = (current ?? []).filter((r) => r.id !== result.data.id);
      return editing.id === null ? [result.data, ...rest] : (current ?? []).map((r) => (r.id === result.data.id ? result.data : r));
    });
    setEditing(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const ok = await deleteReview(authorizedFetch, subscriberId, deleting.id);
    if (ok) setReviews((current) => (current ?? []).filter((r) => r.id !== deleting.id));
    setDeleting(null);
  }

  const update = (patch: Partial<Draft>) => editing && setEditing({ ...editing, draft: { ...editing.draft, ...patch } });

  return (
    <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquareText size={20} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-ink">{t("title")}</h2>
            <p className="text-xs text-ink-muted">{t("subtitle")}</p>
          </div>
        </div>
        {!readOnly && !editing && (
          <Button variant="secondary" onClick={() => { setError(null); setEditing({ id: null, draft: EMPTY }); }}>
            <Plus size={16} />
            {t("new")}
          </Button>
        )}
      </div>

      {editing && (
        <div className="mt-4 flex flex-col gap-4 rounded-field border border-primary/25 bg-primary/5 p-4">
          <Select label={t("ratingLabel")} value={editing.draft.rating} onChange={(e) => update({ rating: e.target.value as ReviewRating | "" })}>
            <option value="">{t("ratingNone")}</option>
            {REVIEW_RATINGS.map((r) => (
              <option key={r} value={r}>
                {t(`rating.${r}`)}
              </option>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="review-note" className="text-sm font-medium text-ink">
              {t("noteLabel")}
            </label>
            <textarea
              id="review-note"
              rows={4}
              maxLength={MAX_NOTE_LENGTH}
              value={editing.draft.note}
              onChange={(e) => update({ note: e.target.value })}
              className="w-full rounded-field border border-border bg-card p-3.5 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <p className="text-xs text-ink-muted tabular-nums">{t("noteCount", { count: editing.draft.note.length, max: MAX_NOTE_LENGTH })}</p>
          </div>

          {(["keyPoints", "tasks"] as const).map((field) => {
            const items = field === "keyPoints" ? editing.draft.keyPoints.map((p) => ({ title: p })) : editing.draft.tasks;
            const set = (next: { id?: number; title: string }[]) =>
              field === "keyPoints" ? update({ keyPoints: next.map((n) => n.title) }) : update({ tasks: next });
            return (
              <div key={field} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t(`${field}Label`)}</span>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={item.title}
                      maxLength={field === "keyPoints" ? 300 : 200}
                      onChange={(e) => set(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                      aria-label={t(`${field}Item`, { n: i + 1 })}
                      className="h-10 min-w-0 flex-1 rounded-field border border-border bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                    />
                    <button type="button" onClick={() => set(items.filter((_, j) => j !== i))} aria-label={t("remove")} className="text-ink-muted hover:text-status-late">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {items.length < 10 && (
                  <button type="button" onClick={() => set([...items, { title: "" }])} className="self-start text-xs font-semibold text-primary hover:underline">
                    + {t(`${field}Add`)}
                  </button>
                )}
              </div>
            );
          })}

          {error && (
            <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button onClick={save} isLoading={saving}>
              {t("save")}
            </Button>
          </div>
          <p className="text-xs text-ink-muted">{t("notifyHint")}</p>
        </div>
      )}

      {failed && <p role="alert" className="mt-4 text-sm text-status-late">{t("loadFailed")}</p>}
      {reviews && reviews.length === 0 && !editing && <p className="mt-4 text-sm text-ink-muted">{t("empty")}</p>}

      {reviews && reviews.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-field border border-border/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {review.rating && <Badge tone={RATING_TONE[review.rating]}>{t(`rating.${review.rating}`)}</Badge>}
                  <span className="text-xs text-ink-muted">{dateFormat.format(new Date(review.created_at))}</span>
                  {review.edited_at && <Badge tone="neutral">{t("edited")}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {review.acknowledged_at ? (
                    <Badge tone="success">{t("acknowledged", { date: dateFormat.format(new Date(review.acknowledged_at)) })}</Badge>
                  ) : (
                    <Badge tone="neutral">{t("notAcknowledged")}</Badge>
                  )}
                  {!readOnly && (
                    <>
                      <button type="button" onClick={() => { setError(null); setEditing({ id: review.id, draft: toDraft(review) }); }} aria-label={t("edit")} className="text-ink-muted hover:text-primary">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => setDeleting(review)} aria-label={t("delete")} className="text-ink-muted hover:text-status-late">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {review.note && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{review.note}</p>}
              {review.key_points.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-ink">
                  {review.key_points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
              {review.tasks.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {review.tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      {task.done_at ? (
                        <CheckCircle2 size={16} className="shrink-0 text-status-on-track" aria-hidden="true" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
                      )}
                      <span className={task.done_at ? "text-ink-muted line-through" : "text-ink"}>{task.title}</span>
                      <span className="sr-only">{task.done_at ? t("taskDone") : t("taskOpen")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)} title={t("deleteTitle")}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">{t("deleteBody")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={confirmDelete}>{t("delete")}</Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
