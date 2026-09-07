import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // No public marketing page in the MVP — the app starts at login.
  // AuthProvider/middleware take over from there once a session exists.
  redirect({ href: "/login", locale });
}
