import { KeyRound } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forgot");

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading icon={KeyRound} title={t("title")} subtitle={t("subtitle")} />
      <ForgotPasswordForm />
    </div>
  );
}
