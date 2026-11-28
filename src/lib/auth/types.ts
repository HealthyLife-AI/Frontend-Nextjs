export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "nutritionist" | "client" | "admin";
  nutritionist_id: number | null;
  /** Google profile picture when the account signed in with Google; null otherwise. */
  avatar_url?: string | null;
  /** A nutritionist's country (ISO code); read-only for them, an admin sets it. */
  country?: string;
  /** Nutritionists only (BE-17): the address is confirmed. */
  email_verified?: boolean;
  /** Nutritionists only (BE-17): unconfirmed AND held to it, so adding patients and the AI are blocked. */
  email_verification_required?: boolean;
};

/** What the browser gets back — never includes the refresh token. */
export type AuthSession = {
  user: AuthUser;
  access_token: string;
  expires_in: number;
};

export type ApiErrorBody = {
  message: string;
  errors?: Record<string, string[]>;
  locked_until?: string;
};
