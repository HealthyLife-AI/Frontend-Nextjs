"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Briefcase, CalendarClock, Globe, Lock, User } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";
import { AvailabilitySettings } from "@/components/appointments/AvailabilitySettings";
import { PageContainer } from "@/components/layout/PageContainer";
import { useNutritionistProfile } from "@/components/nutritionists/NutritionistProfileProvider";
import { ProfileCompletion } from "@/components/settings/ProfileCompletion";
import { ProfilePreview } from "@/components/settings/ProfilePreview";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextField } from "@/components/ui/TextField";
import { getNutritionistProfile, saveNutritionistProfile } from "@/lib/nutritionists/api";
import { WHATSAPP_PATTERN, type NutritionistGender, type NutritionistProfile } from "@/lib/nutritionists/types";

/** The editable fields as the form holds them: "" for a cleared one. */
type FormValues = {
  specialty: string;
  clinicName: string;
  gender: NutritionistGender | "";
  whatsapp: string;
  replyHours: string;
  bio: string;
};

const EMPTY: FormValues = { specialty: "", clinicName: "", gender: "", whatsapp: "", replyHours: "", bio: "" };

function toForm(p: NutritionistProfile): FormValues {
  return {
    specialty: p.specialty ?? "",
    clinicName: p.clinic_name ?? "",
    gender: p.gender ?? "",
    whatsapp: p.whatsapp_number ?? "",
    replyHours: p.reply_hours ?? "",
    bio: p.bio ?? "",
  };
}

const LOCALE_LABELS: Record<string, string> = { ar: "العربية", en: "English" };

/**
 * S4-00 / FR-28: the nutritionist's own account and professional profile.
 *
 * Scope is exactly what the API exposes: the editable fields (specialty,
 * clinic, gender, WhatsApp, reply hours, bio — all shown to the
 * nutritionist's patients in the app), the account identity read-only from
 * the JWT, and the plan tier read-only (BR-12: a nutritionist must not be
 * able to promote themselves by editing a form).
 *
 * Layout: the sections in a main column, and a side column with the
 * section nav, a live preview of what patients see, and a completeness
 * checklist. The side column is sticky beside the main one, and stacks
 * above it (nav as a pill row) when the page is narrower than 860px.
 *
 * Unsaved profile edits are tracked against the last loaded or saved copy:
 * the profile footer says so, a sticky bar offers save / discard once that
 * footer is out of view, and leaving the page asks first (beforeunload —
 * a browser-level close or reload).
 *
 * Deliberately NOT here: `/system/ai-status` and `/system/fcm-status`,
 * operator diagnostics a clinical user has no action to take on.
 */
export default function SettingsPage() {
  const t = useTranslations("settings");
  const tAvailability = useTranslations("appointments.availability");
  const { user, authorizedFetch } = useAuth();
  const { setProfile: shareProfile } = useNutritionistProfile();

  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [saved, setSaved] = useState<FormValues>(EMPTY);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const footerRef = useRef<HTMLDivElement>(null);
  const [footerVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getNutritionistProfile(authorizedFetch).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        setLoadFailed(true);
        return;
      }

      setProfile(result.data);
      setSaved(toForm(result.data));
      setValues(toForm(result.data));
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  const dirty = (Object.keys(values) as (keyof FormValues)[]).some((key) => values[key] !== saved[key]);

  // Closing or reloading the tab with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // The sticky save bar shows only while the profile footer is off screen.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setNotice(null);
  }

  function discard() {
    setValues(saved);
    setWhatsappError(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    // Same rule as the API (E.164), checked first so a typo doesn't cost a
    // round trip. Spaces and dashes people naturally type are stripped
    // rather than rejected; the leading + is not guessed at.
    const whatsappValue = values.whatsapp.replace(/[\s-]/g, "");
    if (whatsappValue && !WHATSAPP_PATTERN.test(whatsappValue)) {
      setWhatsappError(t("whatsappInvalid"));
      document.getElementById("whatsapp")?.focus();
      return;
    }
    setWhatsappError(null);
    setSaving(true);

    // Empty string means "cleared", which the API models as null — sending
    // "" would store an empty string and read back as a set-but-blank field.
    const result = await saveNutritionistProfile(authorizedFetch, {
      specialty: values.specialty.trim() || null,
      clinic_name: values.clinicName.trim() || null,
      gender: values.gender || null,
      whatsapp_number: whatsappValue || null,
      reply_hours: values.replyHours.trim() || null,
      bio: values.bio.trim() || null,
    });

    setSaving(false);

    if (!result.ok) {
      const fieldError = result.error.errors?.whatsapp_number?.[0];
      if (fieldError) setWhatsappError(t("whatsappInvalid"));
      else setError(result.error.message || t("saveFailed"));
      return;
    }

    setProfile(result.data);
    setSaved(toForm(result.data));
    setValues(toForm(result.data));
    // Keeps the dashboard's completion banner in step without a reload.
    shareProfile(result.data);
    setNotice(t("saved"));
  }

  const navItems = useMemo(
    () => [
      { id: "account", label: t("accountSection"), icon: User },
      { id: "profile", label: t("profileSection"), icon: Briefcase },
      { id: "availability", label: tAvailability("title"), icon: CalendarClock },
      { id: "language", label: t("languageSection"), icon: Globe },
    ],
    [t, tAvailability]
  );

  // Same rule as ProfileCompletionBanner for gender and WhatsApp (missing =
  // null on the SAVED profile), applied to all six patient-facing fields:
  // a field counts once patients can actually see it.
  const completion = profile
    ? [
        { key: "specialty", label: t("specialtyLabel"), done: profile.specialty !== null, fieldId: "specialty" },
        { key: "clinic", label: t("clinicLabel"), done: profile.clinic_name !== null, fieldId: "clinic" },
        { key: "gender", label: t("genderLabel"), done: profile.gender !== null, fieldId: "gender-female" },
        { key: "whatsapp", label: t("whatsappLabel"), done: profile.whatsapp_number !== null, fieldId: "whatsapp" },
        { key: "bio", label: t("bioLabel"), done: profile.bio !== null, fieldId: "bio" },
        { key: "replyHours", label: t("replyHoursShort"), done: profile.reply_hours !== null, fieldId: "reply-hours" },
      ]
    : null;

  const statusDot = <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-status-attention" aria-hidden="true" />;

  return (
    <PageContainer variant="detail">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="@container">
        {/* DOM order is main, side; below 860px of width the side column shows first. */}
        <div className="flex flex-col-reverse gap-5 @min-[860px]:flex-row @min-[860px]:items-start">
          <div className="flex min-w-0 flex-col gap-5 @min-[860px]:grow-[999] @min-[860px]:basis-[520px]">
            <SettingsSection id="account" icon={User} title={t("accountSection")} description={t("accountDescription")}>
              <div className="overflow-hidden rounded-[14px] border border-border">
                <dl className="-ms-px -mt-px grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]">
                  <Fact label={t("nameLabel")}>
                    <bdi>{user?.name ?? "—"}</bdi>
                  </Fact>
                  <Fact label={t("emailLabel")} ltr>
                    {user?.email ?? "—"}
                  </Fact>
                  <Fact label={t("phoneLabel")} ltr>
                    {user?.phone ?? "—"}
                  </Fact>
                  <Fact label={t("planTierLabel")}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={profile?.plan_tier === "professional" ? "primary" : "neutral"}>{t(`tier.${profile?.plan_tier ?? "none"}`)}</Badge>
                      <span className="text-[13px] font-normal text-ink-muted">{t("planTierShort")}</span>
                    </span>
                  </Fact>
                </dl>
              </div>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-muted">
                <Lock size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                {t("accountNote")}
              </p>
            </SettingsSection>

            <form id="profile-form" onSubmit={handleSubmit} noValidate>
              <SettingsSection
                id="profile"
                icon={Briefcase}
                title={t("profileSection")}
                description={t("profileDescription")}
                footerRef={footerRef}
                footerStatus={
                  dirty ? (
                    <span className="flex items-center gap-2 font-semibold text-status-attention-ink">
                      {statusDot}
                      {t("unsaved")}
                    </span>
                  ) : error ? (
                    <span role="alert" className="font-semibold text-status-late-ink">
                      {error}
                    </span>
                  ) : notice ? (
                    <span role="status" className="font-semibold text-status-on-track-ink">
                      {notice}
                    </span>
                  ) : null
                }
                footerAction={
                  <Button type="submit" isLoading={saving} disabled={!dirty}>
                    {saving ? t("saving") : t("save")}
                  </Button>
                }
              >
                {loadFailed && (
                  <p role="alert" className="mb-4 rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
                    {t("loadFailed")}
                  </p>
                )}
                {dirty && error && (
                  <p role="alert" className="mb-4 rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late-ink">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-[18px] gap-y-4">
                  <TextField
                    id="specialty"
                    label={t("specialtyLabel")}
                    placeholder={t("specialtyPlaceholder")}
                    value={values.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    maxLength={255}
                  />
                  <TextField id="clinic" label={t("clinicLabel")} value={values.clinicName} onChange={(e) => set("clinicName", e.target.value)} maxLength={255} />

                  <GenderField value={values.gender} onChange={(g) => set("gender", g)} />

                  <TextField
                    id="whatsapp"
                    label={t("whatsappLabel")}
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    placeholder="+970599123456"
                    value={values.whatsapp}
                    onChange={(e) => {
                      set("whatsapp", e.target.value);
                      setWhatsappError(null);
                    }}
                    error={whatsappError ?? undefined}
                    hint={t("whatsappHint")}
                    maxLength={24}
                  />

                  <div className="col-span-full">
                    <TextField
                      id="reply-hours"
                      label={t("replyHoursLabel")}
                      placeholder={t("replyHoursPlaceholder")}
                      value={values.replyHours}
                      onChange={(e) => set("replyHours", e.target.value)}
                      hint={t("replyHoursHint")}
                      maxLength={100}
                    />
                  </div>

                  <div className="col-span-full flex flex-col gap-1.5">
                    <label htmlFor="bio" className="text-sm font-bold text-ink">
                      {t("bioLabel")}
                    </label>
                    <textarea
                      id="bio"
                      value={values.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      maxLength={1000}
                      rows={4}
                      aria-describedby="bio-hint"
                      className="w-full rounded-field border border-border bg-canvas/60 p-3.5 text-sm leading-relaxed text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13px] text-ink-muted">
                      <span id="bio-hint">{t("bioHint")}</span>
                      <span className="tabular-nums" dir="ltr">
                        {values.bio.length} / 1000
                      </span>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            </form>

            <AvailabilitySettings />

            <LanguageSection />

            {/* Shown once the profile footer has scrolled away, so save / discard stay at hand. */}
            {dirty && (
              <div
                aria-hidden={footerVisible}
                className={`sticky bottom-0 z-10 -mt-1 flex flex-wrap items-center justify-between gap-3 rounded-t-panel border-t border-border bg-card px-5 py-3 shadow-[0_-12px_32px_-16px_rgba(11,46,48,0.25)] motion-safe:transition-[transform,opacity] motion-safe:duration-300 ${
                  footerVisible ? "pointer-events-none invisible translate-y-full opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-ink">
                  {statusDot}
                  {t("unsavedBar")}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={discard} disabled={saving}>
                    {t("discard")}
                  </Button>
                  <Button type="submit" form="profile-form" isLoading={saving}>
                    {t("save")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-4 @min-[860px]:sticky @min-[860px]:top-[88px] @min-[860px]:max-w-[340px] @min-[860px]:grow @min-[860px]:basis-[300px]">
            <SettingsNav label={t("sectionsNav")} items={navItems} />
            <ProfilePreview name={user?.name ?? ""} values={values} />
            {completion && <ProfileCompletion items={completion} />}
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}

/** One read-only account fact; the hairlines between cells come from each cell's top and start borders. */
function Fact({ label, ltr = false, children }: { label: string; ltr?: boolean; children: React.ReactNode }) {
  return (
    <div className="border-s border-t border-divider px-4 py-3">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-bold text-ink">
        {/* An inline ltr run keeps "+970…" and the e-mail in order while the cell keeps the page's alignment. */}
        {ltr ? <span dir="ltr">{children}</span> : children}
      </dd>
    </div>
  );
}

/** الجنس as a segmented radio group: the same three values as the old select ("" = not set). */
function GenderField({ value, onChange }: { value: NutritionistGender | ""; onChange: (value: NutritionistGender | "") => void }) {
  const t = useTranslations("settings");
  const options: { value: NutritionistGender | ""; label: string; id: string }[] = [
    { value: "female", label: t("genderFemale"), id: "gender-female" },
    { value: "male", label: t("genderMale"), id: "gender-male" },
    { value: "", label: t("genderNone"), id: "gender-none" },
  ];

  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-bold text-ink">{t("genderLabel")}</legend>
      <div className="flex min-h-12 rounded-field bg-divider p-1">
        {options.map((option) => (
          <label key={option.id} className="flex-1">
            <input
              type="radio"
              id={option.id}
              name="gender"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="flex h-full min-h-10 cursor-pointer items-center justify-center rounded-[10px] px-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink peer-checked:bg-card peer-checked:font-bold peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** «اللغة»: one row, with the locale switch as a 40px segmented control (same behaviour as LocaleSwitcher). */
function LanguageSection() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <section id="language" aria-labelledby="language-title" className="flex flex-wrap items-center justify-between gap-4 rounded-panel border border-border/70 bg-card px-6 py-[22px] shadow-panel">
      <div className="flex min-w-0 flex-1 basis-[260px] items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Globe size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="language-title" className="text-lg font-extrabold leading-snug text-ink">
            {t("languageSection")}
          </h2>
          <p className="text-sm text-ink-muted">{t("languageNote")}</p>
        </div>
      </div>
      <div role="group" aria-labelledby="language-title" className="flex rounded-field bg-divider p-1">
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={l === locale}
            onClick={() => router.replace(pathname, { locale: l })}
            className={`h-10 min-w-24 rounded-[10px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              l === locale ? "bg-card font-bold text-primary shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    </section>
  );
}
