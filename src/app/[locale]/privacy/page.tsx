import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

const SECTIONS = ["s1", "s2", "s3", "s4"] as const;

/**
 * Public privacy-policy page — the URL the patient app links to from its
 * consent screen (`CONSENT_POLICY_URL`). The text here is a clearly marked
 * DRAFT placeholder: the real policy is provided by the product owner and
 * replaces this before launch. Nothing on it is, or should be read as, the
 * policy patients agree to. Kept out of search indexes until then.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });

  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

  return (
    <LegalPage title={t("title")} intro={t("intro")} draft>
      {SECTIONS.map((key) => (
        <LegalSection key={key} heading={t(`${key}Title`)}>
          <p>{t("placeholder")}</p>
        </LegalSection>
      ))}
    </LegalPage>
  );
}
