"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { ClientConsent } from "@/lib/clients/types";

/**
 * BR-17: whether this patient has accepted the privacy policy, and which
 * version and when — the record a nutritionist may be asked about. Three
 * states, each stated in words as well as colour:
 *  - accepted the current version (or no version is configured yet);
 *  - accepted an older version — they will be asked again in the app;
 *  - never accepted — the app's data stays locked until they do.
 * Renders nothing when there is nothing to say (never accepted and no
 * version configured, e.g. a development server).
 */
export function ConsentStatus({ consent }: { consent: ClientConsent }) {
  const t = useTranslations("clients.detail.consent");
  const locale = useLocale();

  const accepted = consent.accepted_version !== null && consent.accepted_at !== null;
  if (!accepted && consent.current_version === null) return null;

  const date = accepted
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(consent.accepted_at!))
    : null;

  const outdated = accepted && consent.up_to_date === false;
  const good = accepted && !outdated;

  // A version like 2026-10-01 is left-to-right text inside an Arabic sentence:
  // <bdi> isolates it from the bidi algorithm and nowrap stops the line
  // breaking it at the hyphens.
  const tags = { v: (chunks: React.ReactNode) => <bdi className="whitespace-nowrap">{chunks}</bdi> };

  const message = good
    ? t.rich("accepted", { ...tags, version: consent.accepted_version!, date: date! })
    : outdated
      ? t.rich("outdated", { ...tags, version: consent.accepted_version!, date: date!, current: consent.current_version! })
      : t.rich("missing", { ...tags, current: consent.current_version! });

  const Icon = good ? ShieldCheck : AlertTriangle;

  return (
    <p
      className={`flex items-start gap-2.5 border-t border-divider px-5 py-3.5 text-sm ${good ? "text-ink-muted" : "bg-status-attention-bg text-ink"}`}
    >
      <Icon size={17} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${good ? "text-status-on-track" : "text-status-attention"}`} aria-hidden="true" />
      <span>
        <span className="font-bold text-ink">{t("label")}</span> {message}
      </span>
    </p>
  );
}
