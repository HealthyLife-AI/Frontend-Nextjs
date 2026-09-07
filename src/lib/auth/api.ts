/**
 * Server-only helper for the `/api/auth/*` route handlers to reach the
 * Laravel API. `LARAVEL_API_URL` has no `NEXT_PUBLIC_` prefix on purpose —
 * the browser never talks to Laravel directly, only to this Next.js app's
 * own routes (see README "Authentication").
 */
const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api/v1";

export type LaravelResponse<T = Record<string, unknown>> = {
  ok: boolean;
  status: number;
  data: T | null;
};

export async function laravelFetch<T = Record<string, unknown>>(
  path: string,
  init: RequestInit = {}
): Promise<LaravelResponse<T>> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${LARAVEL_API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as T | null;

  return { ok: res.ok, status: res.status, data };
}
