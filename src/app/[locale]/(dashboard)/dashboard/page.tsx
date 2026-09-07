import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

/**
 * PRD §5 lists a single combined "Client List / Dashboard" screen — the
 * approved Stitch reference (design-reference/.../nutricare_3) confirms
 * it lives under the "Patients" nav item (that's the highlighted item in
 * the mockup, not "Home"). Rather than duplicate that content at two
 * routes, `/dashboard` (the stable post-login redirect target hardcoded
 * in LoginForm/RegisterForm/AppShell since Sprint 1) forwards to where
 * the real screen lives.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect({ href: "/dashboard/patients", locale });
}
