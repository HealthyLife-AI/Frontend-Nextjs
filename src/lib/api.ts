/**
 * The shared shape every feature module's API wrapper uses. Extracted
 * when `lib/progress` became the second consumer — a third copy of the
 * same twelve lines is how error handling starts drifting between
 * features.
 *
 * `fetcher` is always `useAuth().authorizedFetch`: it attaches the access
 * token and transparently refreshes once on a 401 (see AuthProvider).
 * Modules take it as an argument rather than importing it, so they stay
 * plain functions that a test can call with a stub.
 */

export type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

export type ApiError = { message: string; errors?: Record<string, string[]> };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError; status: number };

export async function parseJson<T>(res: Response): Promise<ApiResult<T>> {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, status: res.status, error: body ?? { message: "Something went wrong." } };
  }

  return { ok: true, data: body as T };
}
