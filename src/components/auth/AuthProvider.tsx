"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AuthUser } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
};

export type AuthActionError = {
  ok: false;
  status: number;
  message: string;
  /** Present on a 423 lockout response (FR-04). */
  lockedUntil?: string;
  /** Present on a 422 validation response (field -> messages). */
  fieldErrors?: Record<string, string[]>;
};

type AuthActionResult = { ok: true } | AuthActionError;

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  /** FR-03: consumes the client's one-time invite token; logs them in on success. */
  activate: (token: string, password: string, passwordConfirmation: string) => Promise<AuthActionResult>;
  /**
   * Call Laravel's data API directly (clients, health profiles, foods,
   * dashboard — NOT the auth endpoints, which stay behind the BFF proxy
   * so the refresh token never reaches the browser). Attaches the
   * current access token; on a 401 (token just expired mid-session —
   * they're short-lived, 15 min by default) transparently refreshes once
   * and retries, so an active user is never forced to re-login just
   * because they kept a tab open.
   */
  authorizedFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? "";

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseError(res: Response): Promise<AuthActionError> {
  const data = await res.json().catch(() => null);

  return {
    ok: false,
    status: res.status,
    message: data?.message ?? "Something went wrong.",
    lockedUntil: data?.locked_until,
    fieldErrors: data?.errors,
  };
}

/**
 * Session lives here and nowhere else on the client: the access token is
 * kept in memory only (never localStorage — see lib/auth/session.ts for
 * why), so this component's mount always starts from `status: "loading"`
 * and silently re-derives the session from the HttpOnly refresh cookie
 * via `/api/auth/refresh`.
 *
 * "This component's mount" happens more often than a hard page reload:
 * `[locale]/layout.tsx` (where this lives) remounts whenever the
 * `[locale]` route param changes — e.g. the locale switcher going from
 * `/en/dashboard` to `/ar/dashboard`. React's dev-mode StrictMode then
 * double-invokes that mount's effect. Since the refresh token is
 * single-use and rotates (FR-05), two concurrent `/api/auth/refresh`
 * calls sharing the same starting cookie is exactly the "reused token"
 * shape the backend's theft-detection reacts to: the first rotates the
 * cookie and succeeds, the second — still holding the pre-rotation
 * cookie because both were dispatched before either got a response —
 * gets treated as a replay and revokes the *entire* session, including
 * the one the first call just legitimately established.
 *
 * `AbortController` does not fix this: aborting only tells the page to
 * stop waiting on a response, it doesn't un-send a request that already
 * left for a same-machine round trip, so both requests still reach the
 * API and the collision still happens server-side either way. The actual
 * fix is `bootstrapStartedRef`: it makes every invocation of this effect
 * after the first one a complete no-op — no fetch call at all — for a
 * given mount, however many times StrictMode (or anything else) invokes
 * the effect for it.
 *
 * Deliberately no `cancelled`/cleanup flag guarding the async chain
 * itself: StrictMode's mount→cleanup→mount dance runs that cleanup
 * *before* the still-in-flight fetch from the surviving chain resolves,
 * so a naive `cancelled = true` in cleanup discards that chain's own
 * result — the one real request succeeds server-side but the app never
 * applies it and sits on "loading" forever. React 18+ made this safe to
 * skip: calling `setState` after a real unmount is a silent no-op, not a
 * warning or a leak, so there's nothing to guard against.
 *
 * (An earlier version of this file also had an `explicitActionRef` meant
 * to let a manual login/register win over a stale in-flight bootstrap
 * call. That ref never resets, so a bootstrap run that starts *after* a
 * login has already happened — exactly the locale-switch remount case
 * above — would see it already `true` and bail out right after rotating
 * the refresh cookie, before ever calling `/me`: same "stuck on loading"
 * symptom, different cause. Removed; the dedupe guard above is the fix
 * that actually matters, and this component doesn't need a second one.)
 *
 * (Not handled: two browser tabs both silently refreshing around the
 * same time would still race each other, since each tab is a separate
 * instance of this component with no shared coordination. Out of scope
 * for Sprint 1 — would need a cross-tab lock, e.g. BroadcastChannel, to
 * close properly.)
 *
 * Sprint 2 adds `authorizedFetch` for DATA endpoints (clients, health
 * profiles, foods, dashboard), called directly against Laravel rather
 * than through a BFF proxy like the auth endpoints. Deliberate: those
 * pages need a Server Component to fetch server-side to be fast, but
 * Next.js forbids mutating cookies during a Server Component render —
 * only a Server Action or Route Handler can — so there's no way to
 * rotate-and-persist the refresh cookie from there. Rather than build a
 * fragile workaround, data fetching stays client-side, consistent with
 * how login/register already work, using the token this component
 * already holds in memory.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    status: "loading",
  });

  const bootstrapStartedRef = useRef(false);

  const applySession = useCallback((accessToken: string, user: AuthUser) => {
    setState({ user, accessToken, status: "authenticated" });
  }, []);

  const clearSession = useCallback(() => {
    setState({ user: null, accessToken: null, status: "unauthenticated" });
  }, []);

  /**
   * Exchange the HttpOnly refresh cookie for a new access token, via the
   * BFF proxy (the only place allowed to rotate that cookie — see the
   * class-level note on why this can't happen from a Server Component).
   * Returns null on any failure; never throws.
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return null;

      const { access_token: accessToken } = await res.json();
      return accessToken as string;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Second (or later) invocation of this same mount's effect: the
    // first one already owns the (only) real fetch chain below.
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;

    (async () => {
      const accessToken = await refreshAccessToken();

      if (!accessToken) {
        clearSession();
        return;
      }

      try {
        const meRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!meRes.ok) {
          clearSession();
          return;
        }

        const user = (await meRes.json()) as AuthUser;

        applySession(accessToken, user);
      } catch {
        clearSession();
      }
    })();
  }, [applySession, clearSession, refreshAccessToken]);

  const authorizedFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const doRequest = (token: string) =>
        fetch(`${LARAVEL_API_URL}${path}`, {
          ...init,
          headers: { ...init.headers, Authorization: `Bearer ${token}` },
        });

      let response: Response | undefined;

      if (state.accessToken) {
        response = await doRequest(state.accessToken);
        if (response.status !== 401) return response;
      }

      // No token yet, or the API just rejected it as expired (they're
      // short-lived by design) — refresh once and retry.
      const fresh = await refreshAccessToken();

      if (!fresh) {
        clearSession();

        return (
          response ??
          new Response(JSON.stringify({ message: "Unauthenticated." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      setState((s) => ({ ...s, accessToken: fresh, status: "authenticated" }));

      return doRequest(fresh);
    },
    [state.accessToken, refreshAccessToken, clearSession]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return parseError(res);

      const data = await res.json();
      applySession(data.access_token, data.user);

      return { ok: true };
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthActionResult> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return parseError(res);

      const data = await res.json();
      applySession(data.access_token, data.user);

      return { ok: true };
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearSession();
  }, [clearSession]);

  const activate = useCallback(
    async (token: string, password: string, passwordConfirmation: string): Promise<AuthActionResult> => {
      const res = await fetch(`/api/auth/activate/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, password_confirmation: passwordConfirmation }),
      });

      if (!res.ok) return parseError(res);

      const data = await res.json();
      applySession(data.access_token, data.user);

      return { ok: true };
    },
    [applySession]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, activate, authorizedFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
