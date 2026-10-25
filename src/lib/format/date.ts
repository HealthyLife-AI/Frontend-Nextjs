/**
 * A date written the way it is said: "السبت، 7 نوفمبر" / "Saturday, 7 November".
 * Shown next to a date input, whose own field follows the browser's locale and
 * is easy to misread. Latin digits and the Gregorian calendar, like the rest
 * of the dashboard. `ymd` is a plain calendar date (YYYY-MM-DD).
 */
export function formatLongDate(ymd: string | null | undefined, locale: string): string {
  if (!ymd) return "";
  const date = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
