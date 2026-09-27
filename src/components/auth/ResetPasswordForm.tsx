"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PasswordStrength } from "./PasswordStrength";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

/**
 * Reset screen the e-mailed link opens (`?token=…&email=…`). Posts the
 * new password to Laravel via the BFF; a bad or expired token comes back
 * as 422 with the broker's message. On success every other session of
 * the account was revoked server-side, so the person signs in afresh.
 */
export function ResetPasswordForm() {
  const t = useTranslations("auth.reset");
  const tCommon = useTranslations("auth.common");
  const tValidation = useTranslations("auth.validation");
  const tErrors = useTranslations("auth.errors");
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-attention-bg text-status-attention">
          <LinkIcon size={24} strokeWidth={1.75} />
        </span>
        <p className="text-pretty text-sm leading-relaxed text-ink-muted">{t("invalidLink")}</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-mkt-teal-deep hover:text-primary">
          {t("requestNew")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldError(null);

    if (password !== passwordConfirmation) {
      setFieldError(tValidation("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, password_confirmation: passwordConfirmation }),
      });
      if (res.ok) {
        setDone(true);
        return;
      }
      const body = await res.json().catch(() => null);
      const passwordErrors: string[] | undefined = body?.errors?.password;
      if (passwordErrors?.length) setFieldError(passwordErrors[0]);
      else setFormError(res.status === 422 ? t("expired") : tErrors("generic"));
    } catch {
      setFormError(tErrors("generic"));
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-page-in">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring" aria-hidden="true" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand">
            <CheckCircle2 size={26} strokeWidth={1.75} />
          </span>
        </span>
        <h2 className="text-xl font-extrabold text-ink">{t("successTitle")}</h2>
        <p className="text-pretty text-sm leading-relaxed text-ink-muted">{t("successBody")}</p>
        <Link
          href="/login"
          className="mt-2 inline-flex h-12 items-center gap-2 rounded-field bg-gradient-to-br from-primary to-mkt-teal-deep px-6 text-sm font-bold text-white shadow-brand"
        >
          {t("goToLogin")}
          <ArrowUpRight size={17} strokeWidth={2.2} className="rtl:-scale-x-100" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="rounded-field bg-canvas px-3.5 py-2.5 text-sm text-ink-muted">
        {t("for")} <span dir="ltr" className="font-semibold text-ink">{email}</span>
      </p>

      <div className="flex flex-col gap-2">
        <TextField
          label={t("password")}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={password ? undefined : t("passwordHint")}
        />
        <PasswordStrength value={password} />
      </div>

      <TextField
        label={t("passwordConfirmation")}
        type="password"
        name="password_confirmation"
        autoComplete="new-password"
        required
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        error={fieldError ?? undefined}
      />

      {formError && (
        <p role="alert" className="rounded-field border border-status-late/20 bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={submitting} className="mt-1 h-12 w-full text-[15px]">
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
