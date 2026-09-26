import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * Matches the Figma footer (`Desktop - 1.svg`, y 5565-5902): white, four
 * columns inside the same 1210px content box as the hero, with column
 * inline-start edges at x 1321 / 942 / 668 / 328 on the 1440 frame
 * (the `lg:grid-cols-[...]` widths + 98px gap reproduce that), headings
 * and tagline in `#006572`, links in ink, then a `#99b9b1` rule and a
 * muted bottom bar.
 *
 * The locale switcher sits in the bottom bar — the Figma header has none,
 * so it moved here from `HomeHeader`.
 *
 * Not taken from the frame: its two social-icon buttons (there are no
 * accounts behind them yet, so they'd be dead links) and its hardcoded
 * "© 2024" (the year stays computed).
 */
export async function HomeFooter() {
  const t = await getTranslations("home.footer");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("home.nav");
  const year = new Date().getFullYear();
  const email = t("email");

  const heading = "mb-5 text-[15px] font-bold text-mkt-teal-deep";
  const link = "text-sm text-ink transition-colors hover:text-mkt-teal-deep";

  return (
    <footer className="bg-card px-4 sm:px-6 lg:px-0">
      <div className="mx-auto max-w-[1210px] pt-10 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[281px_176px_242px_1fr] lg:gap-[98px]">
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, not a next/image candidate (fixed aspect wordmark, no responsive srcset needed) */}
            <img src="/home/logo.png" alt={tCommon("brandName")} className="-ms-3 h-[78px] w-auto self-start" />
            <p className="text-sm leading-5 text-mkt-teal-deep">{t("tagline")}</p>
          </div>

          <nav className="flex flex-col" aria-label={t("quickLinks")}>
            <span className={heading}>{t("quickLinks")}</span>
            <div className="flex flex-col gap-2">
              <a href="#" className={link}>{tNav("home")}</a>
              <a href="#how-it-works" className={link}>{t("linkHowItWorks")}</a>
              <a href="#for-specialists" className={link}>{t("linkForSpecialists")}</a>
              <a href="#patient-app" className={link}>{t("linkPatientApp")}</a>
            </div>
          </nav>

          <div className="flex flex-col">
            <span className={heading}>{t("supportLinks")}</span>
            <div className="flex flex-col gap-2">
              {/* No policy pages exist yet — plain text rather than dead links. */}
              <span className="text-sm text-ink">{t("privacyPolicy")}</span>
              <span className="text-sm text-ink">{t("terms")}</span>
              <a href="#faq" className={link}>{t("faq")}</a>
              <a href={`mailto:${email}`} className={link}>{t("supportTechnical")}</a>
            </div>
          </div>

          <div className="flex flex-col">
            <span className={heading}>{t("contactTitle")}</span>
            <div className="flex flex-col gap-2">
              <a href={`mailto:${email}`} className={`flex items-center gap-2 ${link}`}>
                <Mail size={17} strokeWidth={1.75} className="text-mkt-teal-deep" />
                <span dir="ltr">{email}</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-ink">
                <MapPin size={17} strokeWidth={1.75} className="text-mkt-teal-deep" />
                <span>{t("location")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[70px] flex flex-col items-center justify-between gap-3 border-t border-[#99b9b1] pt-5 text-center text-xs text-mkt-nav-muted md:flex-row md:text-start">
          <span>{t("copyright", { year })}</span>
          <div className="flex items-center gap-4">
            <span>{t("privacyShort")}</span>
            <span>{t("securityShort")}</span>
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
