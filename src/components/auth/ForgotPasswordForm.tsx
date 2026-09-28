"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, MailCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

/**
 * "Forgot password": asks Laravel (via the BFF) to e-mail a reset link
 * for the current locale. The API answers the same way whether or not
 * the address has an account, and so does this screen — the success
 * state never confirms that an account exists.
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const tCommon = useTranslations("auth.common");
  const tErrors = useTranslations("auth.errors");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setSent(true);
        return;
      }
      setFormError(res.status === 429 ? tErrors("tooMany") : tErrors("generic"));
    } catch {
      setFormError(tErrors("generic"));
    }
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-page-in">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring" aria-hidden="true" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand">
            <MailCheck size={26} strokeWidth={1.75} />
          </span>
        </span>
        <h2 className="text-xl font-extrabold text-ink">{t("sentTitle")}</h2>
        <p className="text-pretty text-sm leading-relaxed text-ink-muted">{t("sentBody", { email })}</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSubmitting(false);
          }}
          className="text-sm font-semibold text-mkt-teal-deep hover:text-primary"
        >
          {t("resend")}
        </button>
        <Link href="/login" className="text-sm text-ink-muted hover:text-ink">
          {tCommon("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label={t("email")}
        type="email"
        name="email"
        autoComplete="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {formError && (
        <p role="alert" className="rounded-field border border-status-late/20 bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={submitting} className="h-12 w-full text-[15px]">
        {submitting ? t("submitting") : t("submit")}
        {!submitting && <ArrowUpRight size={17} strokeWidth={2.2} className="rtl:-scale-x-100" />}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-mkt-teal-deep hover:text-primary">
          {tCommon("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
