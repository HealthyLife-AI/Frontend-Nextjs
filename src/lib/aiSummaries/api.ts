import { type Fetcher, parseJson } from "@/lib/api";
import type { AiSummaryListResponse } from "./types";

/**
 * `aiSummaries()` on the Subscriber model is already `orderByDesc
 * ('week_start')`, so `data[0]` of the first page is the latest summary
 * — there is no separate "latest" endpoint to call.
 */
export function listAiSummaries(fetcher: Fetcher, subscriberId: number | string) {
  return fetcher(`/clients/${subscriberId}/ai-summaries`).then((res) =>
    parseJson<AiSummaryListResponse>(res)
  );
}
