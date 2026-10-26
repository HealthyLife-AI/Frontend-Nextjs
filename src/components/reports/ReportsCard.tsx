"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, FileText } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { formatLongDate } from "@/lib/format/date";
import { fetchReportFile, listReports, updateReport, type PatientReport } from "@/lib/reports/api";

const kb = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/**
 * Phase 4, A9: "التقارير الطبية": what the patient uploaded, newest first, with a
 * viewer (image or PDF) fed from the authenticated stream, a note box and
 * «تمت المراجعة». Hidden entirely while the feature flag is off (the list
 * answers 404). Nothing here is ever sent to an AI.
 */
export function ReportsCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [reports, setReports] = useState<PatientReport[] | null>(null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<PatientReport | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [viewError, setViewError] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listReports(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) setReports(r.data);
      else setHidden(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  // The blob lives only while the viewer is open.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let url: string | null = null;

    fetchReportFile(authorizedFetch, subscriberId, open.id).then((blob) => {
      if (cancelled) return;
      if (!blob) return setViewError(true);
      url = URL.createObjectURL(blob);
      setBlobUrl(url);
    });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [authorizedFetch, subscriberId, open]);

  const close = useCallback(() => {
    setOpen(null);
    setBlobUrl(null);
    setViewError(false);
    setError(null);
  }, []);

  if (hidden || reports === null) return null;

  function view(report: PatientReport) {
    setBlobUrl(null);
    setViewError(false);
    setNote(report.nutritionist_note ?? "");
    setOpen(report);
  }

  async function save(markReviewed: boolean) {
    if (!open) return;
    setBusy(true);
    setError(null);

    const r = await updateReport(authorizedFetch, subscriberId, open.id, { nutritionist_note: note.trim() === "" ? null : note.trim(), ...(markReviewed ? { reviewed: true } : {}) });
    setBusy(false);

    if (!r.ok) return setError(t("saveFailed"));
    setReports((list) => list?.map((x) => (x.id === r.data.id ? r.data : x)) ?? null);
    setOpen(r.data);
  }

  return (
    <section className="flex flex-col gap-3 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <FileText size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("helper")}</p>
        </div>
      </div>

      {reports.length === 0 && <p className="text-sm text-ink-muted">{t("empty")}</p>}

      <ul className="flex flex-col gap-2">
        {reports.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => view(r)}
              className="flex w-full flex-wrap items-center justify-between gap-2 rounded-field border border-border/70 p-3 text-start transition-colors hover:border-primary/40 hover:bg-mkt-mint-bg/40"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-ink">{r.title}</span>
                <span className="text-xs text-ink-muted">
                  {t(`category.${r.category}`)}
                  {r.report_date ? ` · ${formatLongDate(r.report_date, locale)}` : ""} · {kb(r.size_bytes)}
                </span>
              </span>
              <Badge tone={r.reviewed ? "success" : "warning"}>{t(r.reviewed ? "reviewed" : "needsReview")}</Badge>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onClose={close} title={open?.title ?? ""} busy={busy} size="lg">
        {open && (
          <div className="flex flex-col gap-4">
            <div className="min-h-48 overflow-hidden rounded-field border border-border/70 bg-canvas">
              {viewError && <p className="p-6 text-center text-sm text-status-late">{t("viewFailed")}</p>}
              {!viewError && !blobUrl && <p className="p-6 text-center text-sm text-ink-muted">…</p>}
              {blobUrl && open.mime === "application/pdf" && <iframe src={blobUrl} title={open.title} className="h-[60vh] w-full" />}
              {blobUrl && open.mime !== "application/pdf" && (
                // eslint-disable-next-line @next/next/no-img-element -- a blob URL of the decrypted file
                <img src={blobUrl} alt={open.title} className="mx-auto max-h-[60vh] w-auto" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-note" className="text-sm font-semibold text-ink">
                {t("note")}
              </label>
              <textarea
                id="report-note"
                value={note}
                maxLength={1000}
                rows={3}
                disabled={readOnly}
                onChange={(e) => setNote(e.target.value)}
                className="w-full resize-y rounded-field border border-border bg-canvas/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <span className="text-xs tabular-nums text-ink-muted">{note.length}/1000</span>
            </div>

            {error && (
              <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
                {error}
              </p>
            )}

            {!readOnly && (
              <div className="flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="secondary" isLoading={busy} onClick={() => save(false)}>
                  {t("saveNote")}
                </Button>
                {!open.reviewed && (
                  <Button type="button" isLoading={busy} onClick={() => save(true)}>
                    <Check size={16} aria-hidden="true" />
                    {t("markReviewed")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </section>
  );
}
