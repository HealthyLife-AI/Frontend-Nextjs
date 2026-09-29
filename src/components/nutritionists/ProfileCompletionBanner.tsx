"use client";

import { UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useNutritionistProfile } from "./NutritionistProfileProvider";

/**
 * Asks a nutritionist to add the two things their patients' app shows
 * about them — gender (how the app addresses them) and a WhatsApp number
 * (how patients reach them). Both are optional in the API, so this is a
 * nudge, not a gate: it shows on every dashboard page while either is
 * missing, names which, and disappears the moment both are set. Hidden on
 * the settings page itself, where the form is already in front of them.
 */
export function ProfileCompletionBanner() {
  const t = useTranslations("settings.completionBanner");
  const pathname = usePathname();
  const { profile } = useNutritionistProfile();

  if (profile === null || pathname === "/dashboard/settings") return null;

  const missing = [
    profile.gender === null ? t("gender") : null,
    profile.whatsapp_number === null ? t("whatsapp") : null,
  ].filter((item): item is string => item !== null);

  if (missing.length === 0) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-panel border border-status-attention/25 bg-status-attention-bg p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <UserRoundCog size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-status-attention" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-ink">{t("title")}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{t("body", { missing: missing.join(t("joiner")) })}</p>
        </div>
      </div>
      <Link
        href="/dashboard/settings"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-status-attention px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t("action")}
      </Link>
    </div>
  );
}
