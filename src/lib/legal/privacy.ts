import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/i18n/routing";

/**
 * The date the published policy text was last changed. The one place to edit when the
 * policy is updated (together with the two files in content/legal/).
 */
export const PRIVACY_LAST_UPDATED = "2026-10-29";

const FILES: Record<Locale, string> = { ar: "privacy.ar.md", en: "privacy.en.md" };

const DATE_LOCALES: Record<Locale, string> = { ar: "ar-u-nu-latn-ca-gregory", en: "en-GB" };

/** "29 أكتوبر 2026" / "29 October 2026". */
export function formatPrivacyDate(locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${PRIVACY_LAST_UPDATED}T00:00:00Z`));
}

/**
 * The policy as Markdown for a locale, read at build time (the page is static).
 *
 * The file's own title and anything between it and the first section (a date or byline
 * line) are dropped: the page renders its own title and the "last updated" line from
 * PRIVACY_LAST_UPDATED, so the date lives in one place. The wording of the policy itself is
 * never touched.
 */
export async function loadPrivacyPolicy(locale: Locale): Promise<string> {
  const raw = await readFile(path.join(process.cwd(), "content", "legal", FILES[locale]), "utf-8");
  const text = raw.replace(/\r\n/g, "\n");
  const firstSection = text.search(/^## /m);

  return firstSection === -1 ? text : text.slice(firstSection);
}
