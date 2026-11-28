"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LinkIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * BE-17: the page the verification e-mail opens (`?id=…&expires=…&token=…`).
 * It sends the three values to the API once, through the BFF, and says what
 * happened. The link is the credential, so no sign-in is needed.
 */
export function VerifyEmailStatus() {
  const t = useTranslations("emailVerification.verify");
  const params = useSearchParams();
  const id = params.get("id");
  const expires = params.get("expires");
  const token = params.get("token");
  const sent = useRef(false);
  const [state, setState] = useState<"working" | "done" | "invalid">(id && expires && token ? "working" : "invalid");

  useEffect(() => {
    if (!id || !expires || !token || sent.current) return;
    sent.current = true;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id), expires: Number(expires), token }),
    })
      .then((res) => setState(res.ok ? "done" : "invalid"))
      .catch(() => setState("invalid"));
  }, [id, expires, token]);

  if (state === "working") {
    return (
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <Loader2 size={28} className="animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-ink-muted">{t("working")}</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-on-track-bg text-status-on-track">
          <CheckCircle2 size={24} strokeWidth={1.75} />
        </span>
        <p className="text-base font-bold text-ink">{t("doneTitle")}</p>
        <p className="text-pretty text-sm leading-relaxed text-ink-muted">{t("doneBody")}</p>
        <Link href="/dashboard" className="text-sm font-semibold text-mkt-teal-deep hover:text-primary">
          {t("continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-attention-bg text-status-attention">
        <LinkIcon size={24} strokeWidth={1.75} />
      </span>
      <p className="text-base font-bold text-ink">{t("invalidTitle")}</p>
      <p className="text-pretty text-sm leading-relaxed text-ink-muted">{t("invalidBody")}</p>
      <Link href="/login" className="text-sm font-semibold text-mkt-teal-deep hover:text-primary">
        {t("signIn")}
      </Link>
    </div>
  );
}
