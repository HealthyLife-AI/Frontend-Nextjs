import { MessageCircle, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

export type PreviewValues = { specialty: string; clinicName: string; whatsapp: string; replyHours: string; bio: string };

/**
 * «كيف يراك مرضاك»: the patient app's "my nutritionist" card, drawn from the
 * form's CURRENT values so it changes while typing, before saving. Every
 * field here is one the patient API returns (PatientNutritionistResource:
 * name, clinic, specialty, WhatsApp, bio, reply hours). Gender is returned
 * too but is not displayed: the app uses it for wording.
 */
export function ProfilePreview({ name, values }: { name: string; values: PreviewValues }) {
  const t = useTranslations("settings.preview");
  const notSet = <span className="text-status-attention-ink">{t("notSet")}</span>;

  // The account name may already carry the title ("د. منى …").
  const bareName = name.replace(/^\s*(د\.|Dr\.?)\s*/i, "");
  const subtitle = [values.specialty.trim(), values.clinicName.trim()].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="preview-title" className="rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <h2 id="preview-title" className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink">
        <Smartphone size={18} strokeWidth={1.9} className="text-primary" aria-hidden="true" />
        {t("title")}
      </h2>

      <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-canvas p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white" aria-hidden="true">
            {bareName.trim().charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-extrabold text-ink">{/* Isolated: an Arabic name inside the English "Dr. …" would otherwise reorder. */}
              {t("doctor", { name: `\u2068${bareName}\u2069` })}</p>
            <p className="text-sm text-ink-muted">{subtitle || notSet}</p>
          </div>
        </div>

        <p className="line-clamp-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink">{values.bio.trim() || notSet}</p>

        <p className="text-sm text-ink-muted">{values.replyHours.trim() ? t("replyHours", { hours: values.replyHours.trim() }) : <>{t("replyHours", { hours: "" })}{notSet}</>}</p>

        {values.whatsapp.trim() && (
          <span className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-status-on-track-bg px-4 text-sm font-bold text-status-on-track-ink">
            <MessageCircle size={17} strokeWidth={1.9} aria-hidden="true" />
            {t("whatsapp")}
          </span>
        )}
      </div>

      <p className="mt-2.5 text-[13px] text-ink-muted">{t("note")}</p>
    </section>
  );
}
