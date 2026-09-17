import { type Fetcher, parseJson } from "@/lib/api";
import type { ProgressResponse } from "./types";

/**
 * S4-04: weight trend, body composition, adherence and the daily-calorie
 * series in ONE call — the Client Profile & Progress screen renders all
 * four together, and three round trips to paint one screen is what
 * NFR-01 is trying to avoid. There is deliberately no separate
 * `getAdherence`: its payload already ships inside this response.
 *
 * `from`/`to` are `YYYY-MM-DD` and must be sent together or not at all
 * (the backend rejects a half-open range rather than silently falling
 * back to the default window). Omitting both gives the trailing 7 days.
 */
export function getProgress(
  fetcher: Fetcher,
  subscriberId: number | string,
  window?: { from: string; to: string }
) {
  const query = window ? `?from=${window.from}&to=${window.to}` : "";

  return fetcher(`/clients/${subscriberId}/progress${query}`).then((res) =>
    parseJson<ProgressResponse>(res)
  );
}
