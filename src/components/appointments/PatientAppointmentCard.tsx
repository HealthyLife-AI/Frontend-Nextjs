"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { RescheduleDialog } from "@/components/appointments/RescheduleDialog";
import { listPatientAppointments, type Appointment } from "@/lib/appointments/api";

/** The patient's next booked appointment, with «تغيير الموعد» (B9). Nothing is shown without one. */
export function PatientAppointmentCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("appointments");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [next, setNext] = useState<Appointment | null>(null);
  const [moving, setMoving] = useState<Appointment | null>(null);

  const load = useCallback(async () => {
    const from = new Date();
    const to = new Date(Date.now() + 31 * 86400000);
    const r = await listPatientAppointments(authorizedFetch, subscriberId, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10));
    if (r.ok) setNext(r.data.find((a) => a.status === "booked" && new Date(a.starts_at).getTime() > Date.now()) ?? null);
  }, [authorizedFetch, subscriberId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!next) return null;

  const when = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(next.starts_at));

  return (
    <section className="flex flex-col gap-3 rounded-panel border border-border/70 bg-card p-5 shadow-panel sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CalendarClock size={20} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("nextTitle")}</h2>
          <p className="text-sm text-ink-muted">
            {when} · {t(`type.${next.type}`)} · {t(`channel.${next.channel}`)}
          </p>
        </div>
      </div>
      {!readOnly && (
        <Button variant="secondary" onClick={() => setMoving(next)}>
          {t("rescheduleButton")}
        </Button>
      )}
      <RescheduleDialog
        appointment={moving}
        onClose={() => setMoving(null)}
        onDone={() => {
          setMoving(null);
          load();
        }}
      />
    </section>
  );
}
