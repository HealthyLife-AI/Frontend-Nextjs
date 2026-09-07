import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import {
  REFRESH_TOKEN_COOKIE,
  clearRefreshCookie,
  setRefreshCookie,
} from "@/lib/auth/session";
type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

/**
 * FR-05: exchange the HttpOnly refresh cookie for a new access token,
 * rotating the cookie. AuthProvider calls this once on mount to silently
 * re-establish a session after a hard page reload (the access token lives
 * only in memory, so a reload always loses it). If the cookie is invalid,
 * expired, or reused (see RefreshTokenService::rotate on the backend —
 * reuse revokes the whole session family), it's cleared here too.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No session." }, { status: 401 });
  }

  const { ok, status, data } = await laravelFetch<RefreshResponse>(
    "/auth/refresh",
    { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }
  );

  if (!ok || !data) {
    const response = NextResponse.json(data, { status });
    clearRefreshCookie(response);
    return response;
  }

  const response = NextResponse.json({
    access_token: data.access_token,
    expires_in: data.expires_in,
  });

  setRefreshCookie(response, data.refresh_token);

  return response;
}
