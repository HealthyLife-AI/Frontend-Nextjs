"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

/**
 * Warning on the admin overview while CONSENT_VERSION isn't set: in
 * production the patient app's data endpoints refuse (503) until it is, so
 * this is the line that tells the operator why patients are locked out.
 * Renders nothing once it's configured.
 */
export function ConsentConfigStatus({ configured }: { configured: boolean }) {
  const t = useTranslations("admin");

  if (configured) return null;

  return (
    <p role="status" className="flex items-start gap-2.5 rounded-field bg-status-attention-bg px-4 py-3 text-sm text-ink">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-attention" />
      <span>{t("consentNotConfigured")}</span>
    </p>
  );
}
