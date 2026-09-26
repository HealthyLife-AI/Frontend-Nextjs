"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Copy, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/clients/api";
import type { ClientGoal } from "@/lib/clients/types";

const GOALS: ClientGoal[] = ["weight_loss", "weight_gain", "weight_maintenance", "health_monitoring"];

type SuccessState = { id: number; name: string; inviteLink: string };

export function AddClientForm() {
  const t = useTranslations("clients.add");
  const tGoals = useTranslations("goals");
  const { authorizedFetch } = useAuth();

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

    // Custom URL scheme into the Flutter client app — never a web URL.
    // Activation happens in-app now; there is no web activation page.
    // "healthylifeai" must match exactly what the Flutter app registers
    // (iOS CFBundleURLSchemes / Android intent-filter). No cost, no
    // external service (Branch.io etc.) — a plain scheme registration on
    // the app side is enough. Known gap: if the client has not installed
    // the app yet, this link does nothing when tapped (no web fallback by
    // design) — flagged to the user, accepted for now.
    const inviteLink = `healthylifeai://activate/${result.data.invite_token}`;
    setSuccess({ id: result.data.client.id, name: result.data.client.name, inviteLink });
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
          <div className="flex items-center gap-2 rounded-field border border-border bg-canvas px-3.5 py-2.5">
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
          <Button type="button" variant="secondary" className="w-full">
            {t("shareWhatsapp")}
          </Button>
        </a>

        {/*
          The critical journey is add -> health profile -> plan -> send
          link, not add -> back to a list to find the client again. This
          is the primary action; WhatsApp above is how the link actually
          reaches the client, so it stays first but secondary-styled.
        */}
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
