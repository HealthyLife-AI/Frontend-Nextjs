import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import { setRefreshCookie } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/types";

type RegisterResponse = AuthSession & { refresh_token: string };

/** F-1 / FR-01: nutritionist self-registration, proxied to Laravel. */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { ok, status, data } = await laravelFetch<RegisterResponse>(
    "/auth/register",
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
