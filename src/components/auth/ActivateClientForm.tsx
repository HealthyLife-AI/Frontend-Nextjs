"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "./AuthProvider";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

/** FR-03: the client sets a password through their one-time invite link. */
export function ActivateClientForm({ token }: { token: string }) {
  const t = useTranslations("auth.activate");
  const tErrors = useTranslations("auth.errors");
  const { activate } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const result = await activate(token, password, passwordConfirmation);

    if (result.ok) {
      router.push("/dashboard");
      return;
    }

    if (result.status === 422) {
      setInvalidLink(true);
    } else {
      setFormError(tErrors("generic"));
    }

    setSubmitting(false);
  }

  if (invalidLink) {
    return (
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold text-ink">{t("invalidTitle")}</h1>
        <p className="text-sm text-ink-muted">{t("invalidBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label={t("password")}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={t("passwordHint")}
        />

        <TextField
          label={t("passwordConfirmation")}
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        {formError && (
          <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={submitting} className="w-full">
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
