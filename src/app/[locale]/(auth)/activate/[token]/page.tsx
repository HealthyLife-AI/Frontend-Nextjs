import { setRequestLocale } from "next-intl/server";
import { ActivateClientForm } from "@/components/auth/ActivateClientForm";

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  // No page-level header: ActivateClientForm renders its own, since it
  // differs between the normal form and the "link is invalid" state.
  return <ActivateClientForm token={token} />;
}
