import { Mail, MapPin, UtensilsCrossed } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function HomeFooter() {
  const t = await getTranslations("home.footer");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("home.nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink px-4 py-16 text-card/70 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={20} strokeWidth={1.75} className="text-accent" />
              <span className="text-lg font-semibold text-card">{tCommon("brandName")}</span>
            </div>
            <p className="text-sm">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-semibold text-card">{t("quickLinks")}</span>
            <a href="#" className="text-sm transition-colors hover:text-card">
              {tNav("home")}
            </a>
            <a href="#how-it-works" className="text-sm transition-colors hover:text-card">
              {tNav("howItWorks")}
            </a>
            <a href="#for-specialists" className="text-sm transition-colors hover:text-card">
              {tNav("forSpecialists")}
            </a>
            <a href="#patient-app" className="text-sm transition-colors hover:text-card">
              {tNav("patientApp")}
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-semibold text-card">{t("supportLinks")}</span>
            <span className="text-sm">{t("privacyPolicy")}</span>
            <span className="text-sm">{t("terms")}</span>
            <a href="#faq" className="text-sm transition-colors hover:text-card">
              {t("supportTechnical")}
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-semibold text-card">{t("contactTitle")}</span>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} strokeWidth={1.75} className="text-accent" />
              <span dir="ltr">{t("email")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} strokeWidth={1.75} className="text-accent" />
              <span>{t("location")}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-card/10 pt-6 text-center text-sm md:flex-row md:text-start">
          <span>{t("copyright", { year })}</span>
          <div className="flex items-center gap-4">
            <span>{t("privacyShort")}</span>
            <span>{t("securityShort")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
