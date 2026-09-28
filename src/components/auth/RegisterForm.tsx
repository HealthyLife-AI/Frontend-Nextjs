"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "./AuthProvider";
import { AuthDivider } from "./AuthDivider";
import { GOOGLE_ENABLED, GoogleButton } from "./GoogleButton";
import { PasswordStrength } from "./PasswordStrength";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("auth.common");
  const tValidation = useTranslations("auth.validation");
  const tErrors = useTranslations("auth.errors");
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: tValidation("passwordMismatch") });
      return;
    }

    setSubmitting(true);

    const result = await register({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });

    if (result.ok) {
      router.push("/dashboard");
      return;
    }

    if (result.fieldErrors) {
      const flattened: Record<string, string> = {};
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        flattened[field] = messages[0];
      }
      setFieldErrors(flattened);
    } else if (result.status === 401 || result.status === 422) {
      setFormError(tErrors("emailTaken"));
    } else {
      setFormError(tErrors("generic"));
    }

    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {GOOGLE_ENABLED && (
        <>
          <GoogleButton mode="register" onError={setFormError} />
          <AuthDivider label={tCommon("or")} />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={t("name")}
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

        <TextField
          label={t("email")}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <div className="flex flex-col gap-2">
          <TextField
            label={t("password")}
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint={fieldErrors.password || password ? undefined : t("passwordHint")}
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
          error={fieldErrors.password_confirmation}
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

        <p className="text-center text-xs leading-relaxed text-ink-muted">{tCommon("terms")}</p>
      </form>

      <p className="text-center text-sm text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-mkt-teal-deep hover:text-primary">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
