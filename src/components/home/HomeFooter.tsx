import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * Footer: four columns over an oversized, near-invisible wordmark
 * running along the bottom edge (a typographic signature rather than
 * decoration), a gradient hairline on top, and the locale switcher in
 * the bottom bar.
 *
 * Not included on purpose: social icons (no accounts behind them yet)
 * and a terms link (no page exists yet — plain text rather than a dead
 * link). The privacy policy links to /privacy (a draft page until the
 * final text is provided). The year is computed.
 */
export async function HomeFooter() {
  const t = await getTranslations("home.footer");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("home.nav");
  const year = new Date().getFullYear();
  const email = t("email");

  const heading = "mb-4 text-sm font-bold text-ink";
  const link = "text-sm text-ink-muted transition-colors hover:text-mkt-teal-deep";

  return (
    <footer className="relative overflow-hidden bg-white px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-4">
            <Image src="/home/logo.png" alt={tCommon("brandFull")} width={160} height={80} className="-ms-3 h-auto w-40 self-start" />
            <p className="max-w-xs text-pretty text-sm leading-6 text-ink-muted">{t("tagline")}</p>
          </div>

          <nav className="flex flex-col" aria-label={t("quickLinks")}>
            <span className={heading}>{t("quickLinks")}</span>
            <div className="flex flex-col gap-2.5">
              <a href="#how-it-works" className={link}>{t("linkHowItWorks")}</a>
              <a href="#why" className={link}>{t("linkWhy")}</a>
              <a href="#patient-app" className={link}>{t("linkPatientApp")}</a>
              <a href="#faq" className={link}>{t("faq")}</a>
            </div>
          </nav>

          <div className="flex flex-col">
            <span className={heading}>{t("supportLinks")}</span>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className={link}>{t("privacyPolicy")}</Link>
              <span className="text-sm text-ink-muted">{t("terms")}</span>
              <Link href="/account-deletion" className={link}>{t("accountDeletion")}</Link>
              <a href={`mailto:${email}`} className={link}>{t("supportTechnical")}</a>
            </div>
          </div>

          <div className="flex flex-col">
            <span className={heading}>{t("contactTitle")}</span>
            <div className="flex flex-col gap-2.5">
              <a href={`mailto:${email}`} className={`flex items-center gap-2 ${link}`}>
                <Mail size={16} strokeWidth={1.75} className="text-mkt-teal-deep" />
                <span dir="ltr">{email}</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <MapPin size={16} strokeWidth={1.75} className="text-mkt-teal-deep" />
                <span>{t("location")}</span>
              </div>
              <a href="#contact" className={`${link} font-semibold text-mkt-teal-deep`}>{tNav("contact")}</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-divider pt-6 text-center text-xs text-ink-muted md:flex-row md:text-start">
          <span>{t("copyright", { year })}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-mkt-teal-deep">{t("privacyShort")}</Link>
            <span>{t("securityShort")}</span>
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Giant wordmark: sits behind the bottom edge, clipped by the footer. */}
      <div
        className="pointer-events-none select-none text-center font-inter text-[22vw] font-black leading-[0.75] tracking-tighter text-ink/[0.035] lg:text-[17rem]"
        aria-hidden="true"
        dir="ltr"
      >
        {t("wordmark")}
      </div>
    </footer>
  );
}
