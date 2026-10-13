"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/Dialog";
import { AddClientForm } from "@/components/clients/AddClientForm";

/**
 * "إضافة مريض" as a popup instead of a navigation, matching
 * BookAppointmentDialog's pattern: stay on the current page (patients
 * list or dashboard home) instead of leaving it for a dedicated route.
 * The caller should remount this on every open (e.g.
 * `key={open ? "open" : "closed"}`) so the form starts fresh.
 */
export function AddPatientDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const t = useTranslations("clients.add");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} title={t("title")} busy={busy}>
      <AddClientForm onClose={onClose} onCreated={onCreated} onBusyChange={setBusy} />
    </Dialog>
  );
}
