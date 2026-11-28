"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "./AuthProvider";

/**
 * BE-17: shown to a nutritionist whose e-mail is unconfirmed AND who is held
 * to it (`email_verification_required`), because adding patients and the AI
 * are blocked for them until it is. Everyone grandfathered by the server
 * never sees it. Offers a new link (the API allows one a minute).
 */
export function EmailVerificationBanner() {
  const t = useTranslations("emailVerification.banner");
  const locale = useLocale();
  const { user, authorizedFetch } = useAuth();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  if (!user?.email_verification_required || user.email_verified) return null;

  async function resend() {
    setState("sending");
    try {
      const res = await authorizedFetch("/auth/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-panel border border-status-attention/25 bg-status-attention-bg p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <MailCheck size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-status-attention" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-ink">{t("title")}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{t("body", { email: user.email })}</p>
          {state === "sent" && <p className="mt-1 text-sm font-semibold text-status-on-track-ink">{t("sent")}</p>}
          {state === "failed" && <p className="mt-1 text-sm font-semibold text-status-late-ink">{t("failed")}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending" || state === "sent"}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-status-attention px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {t("resend")}
      </button>
    </div>
  );
}
