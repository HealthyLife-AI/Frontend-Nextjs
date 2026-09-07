import type { NextResponse } from "next/server";

/**
 * BFF session model (see README "Authentication"): the refresh token
 * issued by the Laravel API (FR-05) is held ONLY as an HttpOnly cookie on
 * this Next.js origin — it is never readable from client JS. The access
 * token is short-lived and kept in memory only (AuthProvider), never
 * persisted to a cookie or localStorage.
 *
 * This file has no server-only imports (no `next/headers`, no Node APIs)
 * because it's shared with `src/middleware.ts`, which runs on the Edge
 * runtime.
 */
export const REFRESH_TOKEN_COOKIE = "hl_refresh";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export function setRefreshCookie(response: NextResponse, token: string): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
