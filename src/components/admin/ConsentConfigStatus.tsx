"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { ConsentConfiguration } from "@/lib/admin/api";

/**
 * Warning on the admin overview while CONSENT_VERSION or CONSENT_POLICY_URL
 * isn't set in the server's environment. Nothing is blocked by it — the API
 * falls back to a default version and to FRONTEND_URL + /privacy — but a
 * policy version should be a deliberate setting, and the app needs a link to
 * the policy. One line per missing value; nothing once both are set.
 */
export function ConsentConfigStatus({ consent }: { consent: ConsentConfiguration }) {
  const t = useTranslations("admin.consentConfig");

  const lines: string[] = [];
  if (!consent.version_set) lines.push(t("versionDefault", { version: consent.version }));
  if (!consent.policy_url_set) {
    lines.push(consent.policy_url ? t("urlDerived", { url: consent.policy_url }) : t("urlMissing"));
  }

  if (lines.length === 0) return null;

  return (
    <div role="status" className="flex items-start gap-2.5 rounded-field bg-status-attention-bg px-4 py-3 text-sm text-ink">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-attention" />
      <div className="flex flex-col gap-1">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
