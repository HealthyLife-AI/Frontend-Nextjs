import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";

const intlMiddleware = createMiddleware(routing);

/**
 * Route-level gate: a dashboard path with no refresh-token cookie never
 * reaches the page. This is a UX shortcut, not the security boundary —
 * the Laravel API enforces auth (and per-nutritionist data isolation) on
 * every request regardless of what the frontend does. A present cookie
 * isn't proven valid here (that requires calling the API); an invalid one
 * simply fails AuthProvider's silent refresh client-side and bounces to
 * login the same way.
 */
function isDashboardPath(pathname: string): boolean {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/dashboard` ||
      pathname.startsWith(`/${locale}/dashboard/`)
  );
}

export default function proxy(request: NextRequest) {
  if (isDashboardPath(request.nextUrl.pathname)) {
    const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);

    if (!hasSession) {
      const locale =
        routing.locales.find((l) =>
          request.nextUrl.pathname.startsWith(`/${l}/`)
        ) ?? routing.defaultLocale;

      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
