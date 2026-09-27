import { Suspense } from "react";
import { LockKeyhole } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

/**
 * Opened from the reset e-mail (`?token=…&email=…`). The form reads the
 * query client-side, hence the Suspense boundary Next requires around
 * `useSearchParams` on a prerendered route.
 */
export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.reset");

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading icon={LockKeyhole} title={t("title")} subtitle={t("subtitle")} />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-field bg-canvas" aria-hidden="true" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
