import { Pin } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Phase 3, A6: the post as the patient's app will show it, in a phone-shaped
 * frame. The text is plain: it goes in as React text nodes (escaped), line
 * breaks kept, nothing parsed as markup or markdown, exactly like the app.
 */
export function PostPhonePreview({ title, body, pinned }: { title: string; body: string; pinned: boolean }) {
  const t = useTranslations("posts");

  return (
    <div className="mx-auto flex w-full max-w-[19rem] flex-col gap-3 rounded-[2rem] border-[6px] border-ink/80 bg-canvas p-4 shadow-float" aria-label={t("previewLabel")}>
      <span className="mx-auto h-1.5 w-16 rounded-full bg-ink/20" aria-hidden="true" />
      <p className="text-[11px] font-bold text-ink-muted">{t("appTitle")}</p>

      <article className="flex flex-col gap-2 rounded-panel border border-border/70 bg-card p-4 shadow-panel">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-[15px] font-extrabold leading-snug text-ink">{title.trim() || t("previewTitlePlaceholder")}</h3>
          {pinned && <Pin size={14} className="mt-1 shrink-0 text-primary" aria-label={t("pinned")} />}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-muted">{body.trim() || t("previewBodyPlaceholder")}</p>
      </article>
    </div>
  );
}
