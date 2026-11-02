import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localeDirections, routing, type Locale } from "@/i18n/routing";
import { LegalPage } from "@/components/legal/LegalPage";
import { PolicyMarkdown } from "@/components/legal/PolicyMarkdown";
import { formatPrivacyDate, loadPrivacyPolicy } from "@/lib/legal/privacy";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });

  return { title: t("title"), description: t("metaDescription") };
}

/**
 * The public privacy policy: the URL the patient app opens from its consent screen. The text is
 * the Markdown in content/legal/privacy.{ar,en}.md, rendered statically per locale; the "last
 * updated" date comes from PRIVACY_LAST_UPDATED (src/lib/legal/privacy.ts).
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");
  const source = await loadPrivacyPolicy(locale);
  const other: Locale = locale === "ar" ? "en" : "ar";

  return (
    <LegalPage title={t("title")}>
      <div dir={localeDirections[locale]} lang={locale} className="-mt-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-divider pb-5 text-sm">
          <p className="font-semibold text-ink-muted">{t("lastUpdated", { date: formatPrivacyDate(locale) })}</p>
          <Link href="/privacy" locale={other} lang={other} hrefLang={other} className="font-bold text-mkt-teal-deep hover:text-primary">
            {t("switchLanguage")}
          </Link>
        </div>

        <PolicyMarkdown source={source} className="mt-6 min-w-0" />
      </div>
    </LegalPage>
  );
}
