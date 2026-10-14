/** Which message to show for the API's 422 on `username` (it only ever says what is wrong, never whose name it is). */
export function usernameErrorKey(message: string | undefined): "usernameTaken" | "usernameArabic" | "usernameRequired" | "usernameInvalid" | null {
  if (!message) return null;
  if (/taken/i.test(message)) return "usernameTaken";
  if (/arabic/i.test(message)) return "usernameArabic";
  if (/required/i.test(message)) return "usernameRequired";
  return "usernameInvalid";
}

/** Country codes offered when adding a patient; +970 first (the default). */
export const COUNTRY_CODES = ["+970", "+972", "+962", "+966", "+971", "+965", "+974", "+973", "+968", "+967", "+961", "+963", "+964", "+20", "+90", "+1", "+44"] as const;

/**
 * +970 and "0599 123-456" → "+970599123456" (a leading 0 of the local
 * number is dropped).
 *
 * A number pasted in full — "+967771234567" or "00967771234567", the
 * shape WhatsApp and contact lists hand out — keeps its own country code
 * and the picker is ignored, instead of being prefixed a second time
 * into "+967967771234567".
 *
 * Bare digits are always treated as local, never as a country code the
 * person happened to type: with +1 selected, "1234567890" is a Californian
 * subscriber number, not country code 1 followed by "234567890".
 */
export function internationalPhone(code: string, local: string): string {
  const eastern = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";
  const typed = local.replace(/[٠-٩۰-۹]/g, (d) => String(eastern.indexOf(d) % 10)).trim();
  const digits = typed.replace(/[^\d]/g, "");

  if (typed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;

  return `${code}${digits.replace(/^0+/, "")}`;
}
