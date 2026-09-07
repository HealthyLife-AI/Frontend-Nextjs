import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";
import { REFRESH_TOKEN_COOKIE, clearRefreshCookie } from "@/lib/auth/session";

/** Revokes this session's refresh token and always clears the cookie. */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await laravelFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  const response = NextResponse.json({ message: "Logged out." });
  clearRefreshCookie(response);

  return response;
}
