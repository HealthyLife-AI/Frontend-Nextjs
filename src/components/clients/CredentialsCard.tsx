"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, Copy, MessageCircle } from "lucide-react";
import { PATIENT_APP_URL, whatsappHref } from "@/lib/whatsapp";

type Props = {
  name: string;
  phone: string | null;
  username: string;
  password: string;
  /** "new": first account; "reset": the nutritionist reset the password. */
  kind: "new" | "reset";
};

/**
 * The patient's username and generated password, shown ONCE. The password
 * lives only in the parent's React state (cleared when it closes): never
 * logged, stored or put in a URL other than the wa.me link.
 */
export function CredentialsCard({ name, phone, username, password, kind }: Props) {
  const t = useTranslations("credentials");
  const [copied, setCopied] = useState<"username" | "password" | null>(null);

  async function copy(which: "username" | "password") {
    await navigator.clipboard.writeText(which === "username" ? username : password);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  const lines =
    kind === "new"
      ? [
          t("message.newGreeting", { name }),
          t("message.username", { username }),
          t("message.password", { password }),
          ...(PATIENT_APP_URL ? [t("message.app", { url: PATIENT_APP_URL })] : []),
          t("message.newHint"),
        ]
      : [t("message.resetGreeting", { name }), t("message.username", { username }), t("message.newPassword", { password }), t("message.resetHint")];

  const row = (label: string, value: string, which: "username" | "password") => (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2 rounded-field border border-border bg-canvas px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-base font-semibold tracking-wide text-ink" dir="ltr">
          {value}
        </span>
        <button type="button" onClick={() => copy(which)} className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {copied === which ? <Check size={16} /> : <Copy size={16} />}
          {copied === which ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {row(t("username"), username, "username")}
      {row(t("password"), password, "password")}

      <p role="note" className="flex items-start gap-2 rounded-field bg-status-attention-bg px-3.5 py-2.5 text-sm font-medium text-ink">
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-status-attention" aria-hidden="true" />
        {t("onceWarning")}
      </p>

      <a
        href={whatsappHref(phone, lines.join("\n"))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-[#25D366] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <MessageCircle size={18} aria-hidden="true" />
        {t("sendWhatsapp")}
      </a>
    </div>
  );
}
