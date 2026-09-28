import { LogIn } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.login");

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading icon={LogIn} title={t("title")} subtitle={t("subtitle")} />
      <LoginForm />
    </div>
  );
}
