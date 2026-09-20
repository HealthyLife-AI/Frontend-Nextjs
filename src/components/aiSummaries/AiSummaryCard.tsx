"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AiSummary } from "@/lib/aiSummaries/types";

/**
 * S5-09: the mockup (nutricare_1) shows a strength/improvement pair
 * inside this card, but the API returns one `summary_text` string —
 * rendering a fabricated two-field structure around it was ruled out
 * this session for meal-plan macros and is ruled out here the same way.
 * The single paragraph IS the summary; it already reads as prose, not a
 * list of fields.
 */
export function AiSummaryCard({ summary }: { summary: AiSummary | null }) {
  const t = useTranslations("aiSummary");

  if (summary === null) {
    return (
      <section className="rounded-card border border-dashed border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles size={18} strokeWidth={1.75} className="text-primary" />
          <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        </div>
        <p className="mt-3 text-sm text-ink-muted">{t("empty")}</p>
        <p className="mt-1 text-xs text-ink-muted/80">{t("emptyHint")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-border bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} strokeWidth={1.75} className="text-primary" />
          <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        </div>
        {/*
          A fallback must never look like the model's own read on the
          client — same rule this session already applied to is_ai_draft.
          "neutral", not "primary": this is explicitly the NOT-AI case.
        */}
        <Badge tone={summary.is_fallback ? "neutral" : "primary"}>
          {t(summary.is_fallback ? "fallbackBadge" : "aiBadge")}
        </Badge>
      </header>

      <p className="mt-1 text-xs text-ink-muted">
        {t("week", { date: summary.week_start })}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-ink">{summary.summary_text}</p>

      <p className="mt-3 text-xs text-ink-muted/80">
        {t("generatedAt", { date: new Date(summary.generated_at).toLocaleString() })}
      </p>
    </section>
  );
}
