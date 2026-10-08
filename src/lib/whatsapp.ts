/**
 * A wa.me link that opens the chat with the patient directly when their
 * phone is in international format (+970599123456), else the contact picker.
 * The text is the only place a generated password may appear in a URL.
 */
export function whatsappHref(phone: string | null | undefined, text: string): string {
  const query = `?text=${encodeURIComponent(text)}`;
  const international = phone?.replace(/[\s-]/g, "");

  return international && /^\+[1-9]\d{7,14}$/.test(international) ? `https://wa.me/${international.slice(1)}${query}` : `https://wa.me/${query}`;
}

/** Optional link to the patient app; the message drops that line when it isn't configured. */
export const PATIENT_APP_URL = process.env.NEXT_PUBLIC_PATIENT_APP_URL?.trim() || null;
