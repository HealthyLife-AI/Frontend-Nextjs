import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import { setRefreshCookie } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/types";

type ActivateResponse = AuthSession & { refresh_token: string };

/**
 * FR-03: client invite-link activation, proxied exactly like
 * register/login — the client sets a password and is logged in
 * immediately (Milestones US-02 AC), so the same HttpOnly-cookie
 * handling applies: the refresh token never reaches browser JS.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const { ok, status, data } = await laravelFetch<ActivateResponse>(
    `/invites/${encodeURIComponent(token)}/activate`,
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
