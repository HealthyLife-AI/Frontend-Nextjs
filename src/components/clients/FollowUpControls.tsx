"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { archiveClient, getClient, resumeClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

/**
 * End follow-up ("إنهاء المتابعة") and resume it. Ending is reversible but
 * stops alerts, reminders, summaries and the patient's app access, so it
 * goes through a confirmation that spells that out. Permanent delete is a
 * separate action (DeleteClientButton).
 */
export function FollowUpControls({ client, onChange }: { client: Client; onChange: (client: Client) => void }) {
  const t = useTranslations("followUp");
  const { authorizedFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function endFollowUp() {
    setBusy(true);
    setError(null);
    const result = await archiveClient(authorizedFetch, client.id);
    setBusy(false);
    if (result.ok) {
      setOpen(false);
      onChange(result.data.client);
    } else {
      setError(t("failed"));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex h-11 items-center gap-2 rounded-field border border-status-attention/40 bg-card px-5 text-sm font-semibold text-status-attention transition-colors hover:bg-status-attention-bg"
      >
        <PauseCircle size={17} strokeWidth={1.9} />
        {t("end")}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t("endTitle", { name: client.name })} busy={busy}>
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink-muted">{t("endBody", { name: client.name })}</p>
          <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm leading-relaxed text-ink">
            {t("endPoints")
              .split("|")
              .map((point) => (
                <li key={point}>{point}</li>
              ))}
          </ul>
          {error && (
            <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              {t("cancel")}
            </Button>
            <Button onClick={endFollowUp} disabled={busy}>
              <PauseCircle size={16} />
              {t("endConfirm")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

/** Top-of-page notice for an archived patient, with the resume action. */
export function FollowUpBanner({ client, onChange }: { client: Client; onChange: (client: Client) => void }) {
  const t = useTranslations("followUp");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const date = client.archived_at
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { dateStyle: "long" }).format(
        new Date(client.archived_at)
      )
    : "";

  async function resume() {
    setBusy(true);
    setError(null);
    const result = await resumeClient(authorizedFetch, client.id);
    setBusy(false);
    if (!result.ok) {
      setError(t("failed"));
      return;
    }
    onChange(result.data.client);
  }

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-status-attention/30 bg-status-attention-bg p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <PauseCircle size={22} className="mt-0.5 shrink-0 text-status-attention" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-ink">{t("bannerTitle", { date })}</h2>
          <p className="text-sm leading-relaxed text-ink-muted">{t("bannerBody")}</p>
          {error && (
            <p role="alert" className="text-sm text-status-late">
              {error}
            </p>
          )}
        </div>
      </div>
      <Button onClick={resume} disabled={busy} className="shrink-0">
        <PlayCircle size={17} />
        {t("resume")}
      </Button>

    </section>
  );
}

export function FollowUpEndedBadge() {
  const t = useTranslations("followUp");
  return <Badge tone="warning">{t("badge")}</Badge>;
}

/**
 * Wraps an editing screen (health profile, plan designer). While the
 * patient is archived every control inside is disabled (a disabled
 * <fieldset> covers inputs and buttons alike) under a read-only notice;
 * the API refuses those writes anyway (409 follow_up_ended).
 */
export function FollowUpGate({ subscriberId, children }: { subscriberId: string; children: React.ReactNode }) {
  const t = useTranslations("followUp");
  const { authorizedFetch } = useAuth();
  const [archived, setArchived] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getClient(authorizedFetch, subscriberId).then((result) => {
      if (!cancelled && result.ok) setArchived(result.data.archived_at !== null);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (!archived) return <>{children}</>;

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="flex items-center gap-2.5 rounded-field bg-status-attention-bg px-4 py-3 text-sm font-semibold text-ink">
        <PauseCircle size={18} className="shrink-0 text-status-attention" />
        {t("readOnly")}
      </p>
      <fieldset disabled className="m-0 min-w-0 border-0 p-0 opacity-80">
        {children}
      </fieldset>
    </div>
  );
}
