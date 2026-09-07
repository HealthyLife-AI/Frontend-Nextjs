import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";

/**
 * Thin passthrough to Laravel's `GET /auth/me`, forwarding whatever
 * Bearer access token the client (AuthProvider) sends. Kept as a proxy
 * rather than called directly from the browser so the browser never
 * needs to know the Laravel API's own origin (see lib/auth/api.ts).
 */
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { status, data } = await laravelFetch<AuthUser>("/auth/me", {
    headers: { Authorization: authorization },
  });

  return NextResponse.json(data, { status });
}
