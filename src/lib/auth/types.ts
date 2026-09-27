export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "nutritionist" | "client" | "admin";
  nutritionist_id: number | null;
  /** Google profile picture when the account signed in with Google; null otherwise. */
  avatar_url?: string | null;
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
