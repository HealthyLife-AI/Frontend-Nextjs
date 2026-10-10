"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { CredentialsCard } from "@/components/clients/CredentialsCard";
import { resetPatientPassword, type PatientCredentials } from "@/lib/clients/api";
import { usernameErrorKey } from "@/lib/clients/credentials";
import type { Client } from "@/lib/clients/types";

/**
 * «إعادة تعيين كلمة المرور» (replaces the sign-in link). Confirms that the
 * patient's current sessions will end, asks for a username when the patient
 * has none yet, then shows the new credentials once.
 */
export function ResetPasswordButton({ client, onUsername }: { client: Client; onUsername?: (username: string) => void }) {
  const t = useTranslations("credentials.reset");
  const tErrors = useTranslations("clients.add.errors");
  const { authorizedFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(client.username ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<PatientCredentials | null>(null);

  const needsUsername = client.username === null;

  function close() {
    // The password is gone for good once this closes.
    setOpen(false);
    setCredentials(null);
    setError(null);
    setUsernameError(null);
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setUsernameError(null);
    const changed = username.trim() !== "" && username.trim() !== client.username ? username.trim() : undefined;
    const result = await resetPatientPassword(authorizedFetch, client.id, changed);
    setBusy(false);

    if (!result.ok) {
      const key = usernameErrorKey(result.error.errors?.username?.[0]);
      if (key) setUsernameError(tErrors(key));
      else setError(result.status === 409 ? t("ended") : t("failed"));
      return;
    }

    setCredentials(result.data);
    onUsername?.(result.data.username);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-field border border-border bg-card px-5 text-sm font-semibold text-ink transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
      >
        <KeyRound size={17} strokeWidth={1.9} />
        {needsUsername ? t("buttonSetUsername") : t("button")}
      </button>

      <Dialog open={open} onClose={close} title={credentials ? t("doneTitle", { name: client.name }) : t("title", { name: client.name })} busy={busy}>
        {credentials ? (
          <div className="flex flex-col gap-4">
            <CredentialsCard name={client.name} phone={client.phone} username={credentials.username} password={credentials.password} kind="reset" />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={close}>
                {t("close")}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={confirm} noValidate className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink-muted">{t("body", { name: client.name })}</p>
            {needsUsername && <p className="rounded-field bg-status-attention-bg px-3.5 py-2.5 text-sm text-ink">{t("noUsernameHint")}</p>}
            <TextField
              label={t("username")}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
                            maxLength={30}
              placeholder="sara.k"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={usernameError ?? undefined}
              hint={needsUsername ? t("usernameAutoHint") : t("usernameKeepHint")}
            />
            {error && (
              <p role="alert" className="text-sm text-status-late">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={close} disabled={busy}>
                {t("cancel")}
              </Button>
              <Button type="submit" isLoading={busy}>
                {t("confirm")}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
