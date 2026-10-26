"use client";

import { useTranslations } from "next-intl";
import type { Food } from "@/lib/clients/types";

/**
 * Phase 4, B4: "اقتصادي" / "بدون طبخ" / "تحضير سهل" next to a food. Only what a
 * nutritionist has reviewed shows (null = unknown = nothing). Never rendered on
 * the print sheet, which does not use this component.
 */
export function FoodTagBadges({ food }: { food: Pick<Food, "cost_tier" | "prep_level"> }) {
  const t = useTranslations("foodTags");
  const tags: string[] = [];

  if (food.cost_tier === "economical") tags.push(t("economical"));
  if (food.prep_level === "no_cook") tags.push(t("noCook"));
  else if (food.prep_level === "easy") tags.push(t("easyPrep"));

  if (tags.length === 0) return null;

  return (
    <span className="inline-flex shrink-0 flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-mkt-mint-bg px-2 py-0.5 text-[11px] font-semibold text-mkt-emerald-deep">
          {tag}
        </span>
      ))}
    </span>
  );
}
