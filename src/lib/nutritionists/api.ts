import { type Fetcher, parseJson } from "@/lib/api";
import type { NutritionistProfile, NutritionistProfileInput } from "./types";

/**
 * No route-bound id on either call — the profile is resolved from the
 * JWT, so there is nothing here to point at another nutritionist's
 * profile with. The row is created lazily on first read, so a GET never
 * 404s for a freshly registered account.
 */
export function getNutritionistProfile(fetcher: Fetcher) {
  return fetcher("/me/nutritionist-profile").then((res) => parseJson<NutritionistProfile>(res));
}

export function saveNutritionistProfile(fetcher: Fetcher, payload: NutritionistProfileInput) {
  return fetcher("/me/nutritionist-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<NutritionistProfile>(res));
}
