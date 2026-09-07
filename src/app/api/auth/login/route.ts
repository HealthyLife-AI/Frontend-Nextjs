import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import { setRefreshCookie } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/types";

type LoginResponse = AuthSession & { refresh_token: string };

/**
 * FR-01 / FR-04: login. Invalid-credential (401) and account-locked (423)
 * responses are forwarded to the client as-is — LoginForm reads
 * `locked_until` off the 423 body to show the lockout message.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { ok, status, data } = await laravelFetch<LoginResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(body) }
  );

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
