export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "nutritionist" | "client" | "admin";
  nutritionist_id: number | null;
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
