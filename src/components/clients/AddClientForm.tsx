"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CredentialsCard } from "@/components/clients/CredentialsCard";
import { createClient, type PatientCredentials } from "@/lib/clients/api";
import { COUNTRY_CODES, internationalPhone, usernameErrorKey } from "@/lib/clients/credentials";
import { GOAL_TYPES, type GoalType } from "@/lib/clients/types";


type SuccessState = { id: number; name: string; phone: string | null; credentials: PatientCredentials };

/**
 * Part A: the nutritionist gives the patient a username; the system
 * generates the password. Both are shown once, to send on WhatsApp.
 * A 422 keeps every field as typed and shows the error under its field.
 */
export function AddClientForm() {
  const t = useTranslations("clients.add");
  const tGoals = useTranslations("healthRecords.goal");
  const { authorizedFetch } = useAuth();

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState<string>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState<GoalType>("weight_loss");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setPhoneError(null);
    setUsernameError(null);
    setSubmitting(true);

    const result = await createClient(authorizedFetch, { name, phone: internationalPhone(countryCode, phone), goal, ...(username.trim() ? { username } : {}) });
    setSubmitting(false);

    if (!result.ok) {
      const errors = result.error.errors ?? {};
      if (errors.phone) setPhoneError(/taken/i.test(errors.phone[0]) ? t("errors.phoneTaken") : t("errors.phoneInvalid"));
      const usernameKey = usernameErrorKey(errors.username?.[0]);
      if (usernameKey) setUsernameError(t(`errors.${usernameKey}`));
      if (!errors.phone && !usernameKey) setFormError(result.error.message);
      return;
    }

    setSuccess({ id: result.data.client.id, name: result.data.client.name, phone: result.data.client.phone, credentials: result.data.credentials });
  }

  function resetForm() {
    setName("");
    setPhone("");
    setUsername("");
    setGoal("weight_loss");
    setSuccess(null);
  }

  if (success) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-on-track-bg text-status-on-track">
            <CheckCircle2 size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">{t("successTitle")}</h2>
            <p className="text-sm text-ink-muted">{t("successSubtitle", { name: success.name })}</p>
          </div>
        </div>

        <CredentialsCard name={success.name} phone={success.phone} username={success.credentials.username} password={success.credentials.password} kind="new" />

        {/* The critical journey is add -> health profile -> plan, not back to the list. */}
        <Link href={`/dashboard/patients/${success.id}/health-profile`}>
          <Button type="button" className="w-full">
            <FileText size={18} strokeWidth={1.75} />
            {t("fillHealthProfile")}
          </Button>
        </Link>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={resetForm} className="font-medium text-primary hover:underline">
            {t("addAnother")}
          </button>
          <Link href="/dashboard/patients" className="font-medium text-ink-muted hover:underline">
            {t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField label={t("name")} name="name" required value={name} onChange={(e) => setName(e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-end gap-2" dir="ltr">
          <div className="w-28 shrink-0">
            <Select label={t("countryCode")} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-0 flex-1" dir="auto">
            <TextField
              label={t("phone")}
              name="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="599 123 456"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={phoneError ?? undefined}
            />
          </div>
        </div>
      </div>

      <TextField
        label={t("username")}
        name="username"
        dir="ltr"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={30}
        placeholder="sara.k"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={usernameError ?? undefined}
      />

      <Select label={t("goal")} value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
        {GOAL_TYPES.map((g) => (
          <option key={g} value={g}>
            {tGoals(g)}
          </option>
        ))}
      </Select>

      {formError && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={submitting} className="w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
