import { UserPlus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading icon={UserPlus} title={t("title")} subtitle={t("subtitle")} />
      <RegisterForm />
    </div>
  );
}
