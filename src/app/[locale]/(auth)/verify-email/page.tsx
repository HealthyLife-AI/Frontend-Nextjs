import { Suspense } from "react";
import { MailCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { VerifyEmailStatus } from "@/components/auth/VerifyEmailStatus";

/**
 * Opened from the verification e-mail (`?id=…&expires=…&token=…`). The status
 * component reads the query client-side, hence the Suspense boundary Next
 * requires around `useSearchParams` on a prerendered route.
 */
export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("emailVerification.verify");

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading icon={MailCheck} title={t("title")} subtitle={t("subtitle")} />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-field bg-canvas" aria-hidden="true" />}>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}
