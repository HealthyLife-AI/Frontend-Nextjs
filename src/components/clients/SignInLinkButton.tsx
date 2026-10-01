"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { issueSignInLink } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

/**
 * «إرسال رابط دخول جديد»: for a patient who can't sign in. The link is a
 * one-time invite token (same app deep link as the first invite); the
 * patient sets a new password with it, and that ends every older session.
 * Issuing a new link cancels any earlier unused one.
 */
export function SignInLinkButton({ client }: { client: Client }) {
  const t = useTranslations("signInLink");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function issue() {
    setBusy(true);
    setError(null);
    const result = await issueSignInLink(authorizedFetch, client.id);
    setBusy(false);
    if (!result.ok) {
      setError(t("failed"));
      return;
    }
    // Same scheme AddClientForm builds — must match the Flutter app's registration.
    setLink({ url: `healthylifeai://activate/${result.data.token}`, expiresAt: result.data.expires_at });
  }

  const expires = link
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { dateStyle: "long" }).format(new Date(link.expiresAt))
    : "";
  const whatsappHref = link ? `https://wa.me/?text=${encodeURIComponent(t("whatsappMessage", { name: client.name, link: link.url }))}` : "";

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={issue}
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-field border border-border bg-card px-5 text-sm font-semibold text-ink transition-colors hover:border-primary/30 hover:text-mkt-teal-deep disabled:opacity-60"
        >
          <KeyRound size={17} strokeWidth={1.9} />
          {t("button")}
        </button>
        {error && (
          <p role="alert" className="text-xs text-status-late">
            {error}
          </p>
        )}
      </div>

      <Dialog open={link !== null} onClose={() => setLink(null)} title={t("title", { name: client.name })}>
        {link && (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink-muted">{t("body", { date: expires })}</p>
            <div className="flex items-center gap-2 rounded-field border border-border bg-canvas px-3.5 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink-muted" dir="ltr">
                {link.url}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(link.url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setLink(null)}>
                {t("done")}
              </Button>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="secondary" className="w-full">
                  {t("share")}
                </Button>
              </a>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
