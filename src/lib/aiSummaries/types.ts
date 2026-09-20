/**
 * Mirrors `GET /clients/{id}/ai-summaries` in
 * Backend/HealthyLife-Laravel/API_CONTRACT.md.
 */

export type AiSummary = {
  id: number;
  week_start: string;
  summary_text: string;
  /**
   * True when the LLM was unreachable/misconfigured and this is the
   * templated fallback (S5-05) — never presented as the model's own
   * assessment (same honesty rule as `is_ai_draft` on meal plans).
   */
  is_fallback: boolean;
  generated_at: string;
};

export type AiSummaryListResponse = {
  data: AiSummary[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};
