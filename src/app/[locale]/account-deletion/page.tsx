import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

/**
 * Read at request time, not build time: the support address is deployment
 * configuration (SUPPORT_EMAIL) and must be changeable without a rebuild.
 */
export const dynamic = "force-dynamic";

/** A plain sanity check, so a typo in the variable can't produce a broken or odd mailto: link. */
const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.accountDeletion" });

  return { title: t("title") };
}

/**
 * The public page that says how a patient deletes their account and their
 * data (a store requirement for apps with accounts): the in-app path, what
 * goes, what the nutritionist is told, and what to do when the app no longer
 * opens (follow-up ended). The support address comes from SUPPORT_EMAIL and
 * is left out entirely when it isn't set.
 */
export default async function AccountDeletionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("legal.accountDeletion");
  const configured = process.env.SUPPORT_EMAIL?.trim() ?? "";
  const email = EMAIL.test(configured) ? configured : null;

  return (
    <LegalPage title={t("title")} intro={t("intro")}>
      <LegalSection heading={t("stepsTitle")}>
        <ol className="list-decimal space-y-1.5 ps-6 marker:font-bold marker:text-primary">
          <li>{t("step1")}</li>
          <li>{t("step2", { path: t("path") })}</li>
          <li>{t("step3")}</li>
        </ol>
      </LegalSection>

      <LegalSection heading={t("deletedTitle")}>
        <p>{t("deletedBody")}</p>
      </LegalSection>

      <LegalSection heading={t("nutritionistTitle")}>
        <p>{t("nutritionistBody")}</p>
      </LegalSection>

      <LegalSection heading={t("endedTitle")}>
        <p>{t("endedBody")}</p>
      </LegalSection>

      {email && (
        <LegalSection heading={t("supportTitle")}>
          <p>
            {t("supportBody")}{" "}
            <a href={`mailto:${email}`} dir="ltr" className="font-bold text-mkt-teal-deep underline-offset-2 hover:underline">
              {email}
            </a>
          </p>
        </LegalSection>
      )}
    </LegalPage>
  );
}
