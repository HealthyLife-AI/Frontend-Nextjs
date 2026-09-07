import { defineRouting } from "next-intl/routing";

/**
 * PRD §7 / NFR "Localization": full Arabic (RTL) + English (LTR).
 * Arabic is the primary market (MVP spec §0) so it is the default locale;
 * English is fully supported, not an afterthought bolted on later.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
