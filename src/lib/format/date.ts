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

/**
 * A timestamp for list rows, relative for the two days people say that way:
 * «اليوم · 11:35 ص», «أمس · 8:20 م», «7 نوفمبر · 9:00 ص» /
 * "Today · 11:35 AM", "Yesterday · 8:20 PM", "Nov 7 · 9:00 AM". The year
 * shows only when it is not the current one. Latin digits, 12-hour clock,
 * the viewer's own time zone. `labels` are the translated day words.
 */
export function formatListDateTime(iso: string, locale: string, labels: { today: string; yesterday: string }, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const tag = locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US";
  const time = new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", hour12: true }).format(date);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  let day: string;
  if (daysAgo === 0) day = labels.today;
  else if (daysAgo === 1) day = labels.yesterday;
  else {
    day = new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: locale === "ar" ? "long" : "short",
      ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
    }).format(date);
  }

  return `${day} · ${time}`;
}

/** A calendar date (YYYY-MM-DD) as a short chip label: «11 نوفمبر» / "Nov 11". Latin digits. */
export function formatShortDay(ymd: string, locale: string): string {
  const date = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", { day: "numeric", month: locale === "ar" ? "long" : "short" }).format(date);
}
