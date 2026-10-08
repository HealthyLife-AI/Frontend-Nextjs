/** Which message to show for the API's 422 on `username` (it only ever says what is wrong, never whose name it is). */
export function usernameErrorKey(message: string | undefined): "usernameTaken" | "usernameArabic" | "usernameRequired" | "usernameInvalid" | null {
  if (!message) return null;
  if (/taken/i.test(message)) return "usernameTaken";
  if (/arabic/i.test(message)) return "usernameArabic";
  if (/required/i.test(message)) return "usernameRequired";
  return "usernameInvalid";
}

/** Country codes offered when adding a patient; +970 first (the default). */
export const COUNTRY_CODES = ["+970", "+972", "+962", "+966", "+971", "+965", "+974", "+973", "+968", "+961", "+963", "+964", "+20", "+90", "+1", "+44"] as const;

/** +970 and "0599 123-456" → "+970599123456" (a leading 0 of the local number is dropped). */
export function internationalPhone(code: string, local: string): string {
  const eastern = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";
  const digits = local
    .replace(/[٠-٩۰-۹]/g, (d) => String(eastern.indexOf(d) % 10))
    .replace(/[^\d]/g, "")
    .replace(/^0+/, "");

  return `${code}${digits}`;
}
