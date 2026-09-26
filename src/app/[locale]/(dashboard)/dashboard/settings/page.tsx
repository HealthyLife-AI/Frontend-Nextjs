"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Badge } from "@/components/ui/Badge";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { getNutritionistProfile, saveNutritionistProfile } from "@/lib/nutritionists/api";
import type { NutritionistProfile } from "@/lib/nutritionists/types";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * S4-00 / FR-28: the nutritionist's own professional profile — the
 * "Settings" nav item, which has linked here since Sprint 1 with no page
 * behind it.
 *
 * Scope is exactly what the API exposes: three editable fields
 * (specialty, clinic name, bio), the account identity read-only from the
 * JWT, and the plan tier read-only because BR-12 keeps it that way — a
 * nutritionist must not be able to promote themselves by editing a form.
 *
 * Deliberately NOT here: `/system/ai-status` and `/system/fcm-status`.
 * They are operator diagnostics about env configuration, and a clinical
 * user has no action to take on "is OPENAI_API_KEY set" — surfacing it
 * would be noise dressed as a setting.
 */
export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, authorizedFetch } = useAuth();

  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [bio, setBio] = useState("");

  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getNutritionistProfile(authorizedFetch).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        setLoadFailed(true);
        return;
      }

      setProfile(result.data);
      setSpecialty(result.data.specialty ?? "");
      setClinicName(result.data.clinic_name ?? "");
      setBio(result.data.bio ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    // Empty string means "cleared", which the API models as null — sending
    // "" would store an empty string and read back as a set-but-blank field.
    const result = await saveNutritionistProfile(authorizedFetch, {
      specialty: specialty.trim() || null,
      clinic_name: clinicName.trim() || null,
      bio: bio.trim() || null,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error.message || t("saveFailed"));
      return;
    }

    setProfile(result.data);
    setNotice(t("saved"));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
        <h2 className="text-base font-bold text-ink">{t("accountSection")}</h2>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-field bg-canvas p-3">
            <dt className="text-xs text-ink-muted">{t("nameLabel")}</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{user?.name ?? "—"}</dd>
          </div>
          <div className="rounded-field bg-canvas p-3">
            <dt className="text-xs text-ink-muted">{t("emailLabel")}</dt>
            <dd className="mt-1 text-sm font-medium text-ink" dir="ltr">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div className="rounded-field bg-canvas p-3">
            <dt className="text-xs text-ink-muted">{t("phoneLabel")}</dt>
            <dd className="mt-1 text-sm font-medium text-ink" dir="ltr">
              {user?.phone ?? "—"}
            </dd>
          </div>
          <div className="rounded-field bg-canvas p-3">
            <dt className="text-xs text-ink-muted">{t("planTierLabel")}</dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone={profile?.plan_tier === "professional" ? "primary" : "neutral"}>
                {t(`tier.${profile?.plan_tier ?? "none"}`)}
              </Badge>
              <span className="text-xs text-ink-muted">{t("planTierNote")}</span>
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-ink-muted/80">{t("accountNote")}</p>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
        <h2 className="text-base font-bold text-ink">{t("profileSection")}</h2>

        {loadFailed && (
          <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {t("loadFailed")}
          </p>
        )}

        <TextField
          label={t("specialtyLabel")}
          placeholder={t("specialtyPlaceholder")}
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          maxLength={255}
        />

        <TextField
          label={t("clinicLabel")}
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          maxLength={255}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-ink">
            {t("bioLabel")}
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            rows={4}
            className="w-full rounded-field border border-border bg-card p-3.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition-all hover:border-ink-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <p className="text-sm text-ink-muted">{t("bioHint")}</p>
        </div>

        {error && (
          <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="rounded-field bg-status-on-track-bg px-3.5 py-2.5 text-sm text-status-on-track">
            {notice}
          </p>
        )}

        <div>
          <Button type="submit" isLoading={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </form>

      <section className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
        <h2 className="text-base font-bold text-ink">{t("languageSection")}</h2>
        <div className="mt-3">
          <LocaleSwitcher />
        </div>
        <p className="mt-3 text-xs text-ink-muted/80">{t("languageNote")}</p>
      </section>
    </div>
  );
}
