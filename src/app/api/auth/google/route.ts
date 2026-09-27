import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import { setRefreshCookie } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/types";

type GoogleResponse = AuthSession & { refresh_token: string };

/**
 * "Continue with Google": forwards the Google access token the browser
 * obtained to Laravel, which verifies it with Google and signs the
 * person in (or creates their nutritionist account). Same cookie
 * handling as login/register — the refresh token never reaches the
 * browser.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { ok, status, data } = await laravelFetch<GoogleResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!ok || !data) {
    return NextResponse.json(data, { status });
  }

  const response = NextResponse.json<AuthSession>(
    { user: data.user, access_token: data.access_token, expires_in: data.expires_in },
    { status }
  );

  setRefreshCookie(response, data.refresh_token);

  return response;
}
