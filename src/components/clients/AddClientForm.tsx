"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/clients/api";
import type { ClientGoal } from "@/lib/clients/types";

const GOALS: ClientGoal[] = ["weight_loss", "weight_gain", "weight_maintenance", "health_monitoring"];

type SuccessState = { name: string; inviteLink: string };

export function AddClientForm() {
  const t = useTranslations("clients.add");
  const tGoals = useTranslations("goals");
  const { authorizedFetch } = useAuth();
  const locale = useLocale();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<ClientGoal>("weight_loss");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setPhoneError(null);
    setSubmitting(true);

    const result = await createClient(authorizedFetch, { name, phone, goal });

    if (!result.ok) {
      if (result.error.errors?.phone) {
        setPhoneError(t("errors.phoneTaken"));
      } else {
        setFormError(result.error.message);
      }
      setSubmitting(false);
      return;
    }

    const inviteLink = `${window.location.origin}/${locale}/activate/${result.data.invite_token}`;
    setSuccess({ name: result.data.client.name, inviteLink });
    setSubmitting(false);
  }

  function resetForm() {
    setName("");
    setPhone("");
    setGoal("weight_loss");
    setSuccess(null);
    setCopied(false);
  }

  async function copyLink() {
    if (!success) return;
    await navigator.clipboard.writeText(success.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (success) {
    const whatsappMessage = t("whatsappMessage", { name: success.name, link: success.inviteLink });
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

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

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t("inviteLinkLabel")}</span>
          <div className="flex items-center gap-2 rounded-control border border-border bg-canvas px-3.5 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink-muted" dir="ltr">
              {success.inviteLink}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t("linkCopied") : t("copyLink")}
            </button>
          </div>
        </div>

        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <Button type="button" className="w-full">
            {t("shareWhatsapp")}
          </Button>
        </a>

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
      <TextField
        label={t("name")}
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label={t("phone")}
        name="phone"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={phoneError ?? undefined}
      />

      <Select label={t("goal")} value={goal} onChange={(e) => setGoal(e.target.value as ClientGoal)}>
        {GOALS.map((g) => (
          <option key={g} value={g}>
            {tGoals(g)}
          </option>
        ))}
      </Select>

      {formError && (
        <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={submitting} className="w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
