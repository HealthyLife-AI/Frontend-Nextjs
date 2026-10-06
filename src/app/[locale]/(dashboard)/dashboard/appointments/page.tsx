"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, MessageSquareText, Phone, Video } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { cancelAppointment, closeAppointment, listAppointments, type Appointment } from "@/lib/appointments/api";

const DAYS = 14;
const STATUS_TONE = { booked: "primary", completed: "success", cancelled: "neutral", no_show: "warning" } as const;
const CHANNEL_ICON = { whatsapp: MessageSquareText, phone: Phone, video: Video };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** «المواعيد»: the next two weeks, grouped by day, with the actions after a call. */
export default function AppointmentsPage() {
  const t = useTranslations("appointments");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const from = new Date();
    const to = new Date(Date.now() + DAYS * 86400000);
    const r = await listAppointments(authorizedFetch, isoDate(from), isoDate(to));
    setFailed(!r.ok);
    if (r.ok) setItems(r.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const day = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
  const time = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  const groups = new Map<string, Appointment[]>();
  for (const a of items ?? []) {
    const key = day.format(new Date(a.starts_at));
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  async function close(a: Appointment, as: "complete" | "no-show") {
    await closeAppointment(authorizedFetch, a.id, as);
    reload();
  }

  async function confirmCancel() {
    if (!cancelling) return;
    setBusy(true);
    await cancelAppointment(authorizedFetch, cancelling.id, reason.trim() || null);
    setBusy(false);
    setCancelling(null);
    setReason("");
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {failed && <p role="alert" className="rounded-field bg-status-late-bg px-4 py-3 text-sm text-status-late">{t("loadFailed")}</p>}
      {items && items.length === 0 && (
        <div className="rounded-panel border border-border/70 bg-card p-8 text-center text-sm text-ink-muted shadow-panel">
          {t("empty")}{" "}
          <Link href="/dashboard/settings" className="font-semibold text-primary hover:underline">
            {t("setAvailability")}
          </Link>
        </div>
      )}
      {[...groups.entries()].map(([label, list]) => (
        <section key={label} className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
            <CalendarClock size={18} className="text-primary" aria-hidden="true" />
            {label}
          </h2>
          <ul className="flex flex-col gap-2">
            {list.map((a) => {
              const Icon = CHANNEL_ICON[a.channel];
              return (
                <li key={a.id} className="flex flex-col gap-3 rounded-field border border-border/70 p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="w-24 shrink-0 text-sm font-bold tabular-nums text-ink" dir="ltr">
                      {time.format(new Date(a.starts_at))}–{time.format(new Date(a.ends_at))}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/dashboard/patients/${a.patient?.id}`} className="text-sm font-semibold text-ink hover:text-primary">
                        {a.patient?.name} <span className="text-xs text-ink-muted" dir="ltr">{a.patient?.code}</span>
                      </Link>
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                        <Icon size={13} aria-hidden="true" /> {t(`channel.${a.channel}`)} · {t(`type.${a.type}`)}
                        {a.topics.length > 0 && ` · ${a.topics.map((x) => t(`topic.${x}`)).join("، ")}`}
                      </p>
                      {a.note && <p className="mt-1 text-xs text-ink">{a.note}</p>}
                      {a.cancel_reason && <p className="mt-1 text-xs text-ink-muted">{t("reason", { reason: a.cancel_reason === "follow_up_ended" ? t("reasonEnded") : a.cancel_reason })}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONE[a.status]}>{t(`status.${a.status}`)}</Badge>
                    {a.status === "booked" && (
                      <>
                        <Button variant="ghost" onClick={() => setCancelling(a)}>
                          {t("cancel")}
                        </Button>
                        <Button variant="secondary" onClick={() => close(a, "no-show")}>
                          {t("noShow")}
                        </Button>
                        <Button onClick={() => close(a, "complete")}>{t("complete")}</Button>
                      </>
                    )}
                    {a.status === "completed" && (
                      <Link href={`/dashboard/patients/${a.patient?.id}#reviews`} className="text-xs font-semibold text-primary hover:underline">
                        {t("writeReview")}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Dialog open={cancelling !== null} onClose={() => setCancelling(null)} title={t("cancelTitle")} busy={busy}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">{t("cancelBody")}</p>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {t("reasonLabel")}
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={3} className="rounded-field border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelling(null)} disabled={busy}>
              {t("back")}
            </Button>
            <Button onClick={confirmCancel} isLoading={busy}>
              {t("confirmCancel")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
