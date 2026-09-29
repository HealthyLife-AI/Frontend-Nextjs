"use client";

import { useEffect, useState } from "react";
import { UserMinus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { dismissDeletionNotice, listDeletionNotices, type DeletionNotice } from "@/lib/notices/api";

/** Only the two screens a nutritionist lands on to see their roster, not every page. */
const SHOWN_ON = ["/dashboard", "/dashboard/patients"];

/**
 * BR-18: tells a nutritionist that a patient deleted their own account —
 * the patient's code and the date, nothing else (nothing else exists any
 * more). One card per notice; "Dismiss" removes it permanently. Mounted
 * for nutritionists only (the endpoint is theirs) and shown on the
 * dashboard home and the patient list, where the roster the patient left
 * is in front of them.
 */
export function DeletionNotices() {
  const t = useTranslations("notices");
  const locale = useLocale();
  const pathname = usePathname();
  const { authorizedFetch } = useAuth();
  const [notices, setNotices] = useState<DeletionNotice[]>([]);
  const [failedId, setFailedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    listDeletionNotices(authorizedFetch).then((result) => {
      if (!cancelled && result.ok) setNotices(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  async function dismiss(id: number) {
    setFailedId(null);
    const done = await dismissDeletionNotice(authorizedFetch, id);

    if (done) setNotices((current) => current.filter((notice) => notice.id !== id));
    else setFailedId(id);
  }

  if (!SHOWN_ON.includes(pathname) || notices.length === 0) return null;

  const dateFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section aria-label={t("region")} className="flex flex-col gap-3">
      {notices.map((notice) => (
        <div key={notice.id} role="status" className="flex items-start gap-3 rounded-panel border border-border/70 bg-card p-4 shadow-panel">
          <UserMinus size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">
              {t.rich("message", {
                code: notice.patient_code,
                date: dateFormat.format(new Date(notice.deleted_at)),
                c: (chunks) => (
                  <bdi dir="ltr" className="font-bold">
                    {chunks}
                  </bdi>
                ),
              })}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{t("detail")}</p>
            {failedId === notice.id && <p role="alert" className="mt-1 text-xs text-danger">{t("dismissFailed")}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(notice.id)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control border border-border px-3 text-xs font-semibold text-ink-muted transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
            {t("dismiss")}
          </button>
        </div>
      ))}
    </section>
  );
}
