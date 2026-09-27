"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "./AuthProvider";
import { AuthDivider } from "./AuthDivider";
import { GOOGLE_ENABLED, GoogleButton } from "./GoogleButton";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("auth.common");
  const tErrors = useTranslations("auth.errors");
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const result = await login(email, password);

    if (result.ok) {
      router.push("/dashboard");
      return;
    }

    // Password is deliberately left in place on failure — never clear a
    // typed credential just because the request failed.
    if (result.status === 423) {
      const minutes = result.lockedUntil
        ? Math.max(1, Math.ceil((new Date(result.lockedUntil).getTime() - Date.now()) / 60000))
        : 15;
      setFormError(tErrors("locked", { minutes }));
    } else if (result.status === 401) {
      setFormError(tErrors("invalidCredentials"));
    } else {
      setFormError(tErrors("generic"));
    }

    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {GOOGLE_ENABLED && (
        <>
          <GoogleButton mode="login" onError={setFormError} />
          <AuthDivider label={tCommon("or")} />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label={t("email")}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <TextField
            label={t("password")}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link href="/forgot-password" className="self-end text-sm font-semibold text-mkt-teal-deep transition-colors hover:text-primary">
            {t("forgotPassword")}
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-field border border-status-late/20 bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={submitting} className="h-12 w-full text-[15px]">
          {submitting ? t("submitting") : t("submit")}
          {!submitting && <ArrowUpRight size={17} strokeWidth={2.2} className="rtl:-scale-x-100" />}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-semibold text-mkt-teal-deep hover:text-primary">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
