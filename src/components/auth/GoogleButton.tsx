"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "./AuthProvider";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Inlined at build time: forms use it to drop the "or" divider along with the button. */
export const GOOGLE_ENABLED = CLIENT_ID !== "";

type TokenClient = { requestAccessToken: (overrides?: { prompt?: string }) => void };
type TokenResponse = { access_token?: string; error?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

/** Loads Google Identity Services once, shared by every button on the page. */
function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error("gis"));
    };
    document.head.appendChild(script);
  });

  return gisPromise;
}

/**
 * "Continue with Google" — the OAuth token-client flow rather than
 * Google's own rendered button, so the control matches the form's
 * styling and works identically in RTL. On click Google opens its
 * account chooser; the resulting access token goes to the BFF
 * (`/api/auth/google`), which has Laravel verify it with Google and sign
 * the person in. Renders nothing when no client id is configured, so a
 * deployment without Google set up simply shows the e-mail form.
 */
export function GoogleButton({ onError, mode }: { onError: (message: string) => void; mode: "login" | "register" }) {
  const t = useTranslations("auth.common");
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const client = useRef<TokenClient | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    loadGis().catch(() => {
      /* surfaced on click */
    });
  }, []);

  const handleClick = useCallback(async () => {
    if (!CLIENT_ID) {
      onError(t("googleUnavailable"));
      return;
    }
    setBusy(true);
    try {
      await loadGis();
    } catch {
      setBusy(false);
      onError(t("googleFailed"));
      return;
    }
    if (!window.google) {
      setBusy(false);
      onError(t("googleFailed"));
      return;
    }

    client.current ??= window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      callback: async (response) => {
        if (!response.access_token) {
          setBusy(false);
          onError(t("googleFailed"));
          return;
        }
        const result = await loginWithGoogle(response.access_token);
        if (result.ok) {
          router.push("/dashboard");
          return;
        }
        setBusy(false);
        onError(result.status === 503 ? t("googleUnavailable") : result.message || t("googleFailed"));
      },
      error_callback: () => setBusy(false),
    });

    client.current.requestAccessToken({ prompt: mode === "register" ? "select_account" : "" });
  }, [loginWithGoogle, mode, onError, router, t]);

  if (!CLIENT_ID) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-field border border-border bg-white text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(11,46,48,0.05)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-px hover:border-primary/40 hover:shadow-card disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-muted/40 border-t-primary" aria-hidden="true" />
      ) : (
        <GoogleMark />
      )}
      {mode === "register" ? t("googleRegister") : t("googleLogin")}
    </button>
  );
}

/** Google's "G" mark — brand colours are the one place hex is intended. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
