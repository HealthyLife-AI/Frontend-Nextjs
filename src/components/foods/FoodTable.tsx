"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { CatalogFood } from "@/lib/foods/api";

const STATUS_TONE = { approved: "success", pending: "warning", rejected: "danger" } as const;

/** Catalog table shared by the nutritionist's food database and the admin food manager. */
export function FoodTable({
  foods,
  showStatus = false,
  showSource = true,
  actions,
  empty,
}: {
  foods: CatalogFood[];
  showStatus?: boolean;
  showSource?: boolean;
  actions?: (food: CatalogFood) => ReactNode;
  empty?: ReactNode;
}) {
  const t = useTranslations("foods");
  const locale = useLocale();

  if (foods.length === 0) {
    return <div className="px-5 py-14 text-center text-sm text-ink-muted">{empty}</div>;
  }

  const num = (n: number | null) => (n === null ? "—" : Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-mkt-mint-bg/60 text-xs font-bold text-mkt-teal-deep">
            <th className="px-5 py-3.5 text-start">{t("colName")}</th>
            <th className="px-3 py-3.5 text-end">{t("colCalories")}</th>
            <th className="px-3 py-3.5 text-end">{t("colProtein")}</th>
            <th className="px-3 py-3.5 text-end">{t("colCarbs")}</th>
            <th className="px-3 py-3.5 text-end">{t("colFat")}</th>
            {showSource && <th className="px-3 py-3.5 text-start">{t("colSource")}</th>}
            {showStatus && <th className="px-3 py-3.5 text-start">{t("colStatus")}</th>}
            {actions && <th className="px-5 py-3.5 text-end">{t("colActions")}</th>}
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => {
            const primary = (locale === "ar" ? food.name_ar : food.name_en) ?? food.name_en ?? food.name_ar;
            const secondary = locale === "ar" ? food.name_en : food.name_ar;

            return (
              <tr key={food.id} className="border-b border-divider last:border-0 hover:bg-mkt-mint-bg/40">
                <td className="max-w-[340px] px-5 py-3">
                  <div className="truncate font-bold text-ink">{primary}</div>
                  {secondary && secondary !== primary && (
                    <div className="truncate text-xs text-ink-muted" dir={locale === "ar" ? "ltr" : "rtl"}>
                      {secondary}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-end font-bold tabular-nums text-ink">{num(food.calories_per_100g)}</td>
                <td className="px-3 py-3 text-end tabular-nums text-ink-muted">{num(food.protein_g_per_100g)}</td>
                <td className="px-3 py-3 text-end tabular-nums text-ink-muted">{num(food.carbs_g_per_100g)}</td>
                <td className="px-3 py-3 text-end tabular-nums text-ink-muted">{num(food.fat_g_per_100g)}</td>
                {showSource && (
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-ink-muted">
                      {t(`source.${food.source}`)}
                    </span>
                  </td>
                )}
                {showStatus && (
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONE[food.status]}>{t(`status.${food.status}`)}</Badge>
                  </td>
                )}
                {actions && <td className="px-5 py-3 text-end">{actions(food)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Previous/next pager in the table footer. */
export function Pager({
  page,
  lastPage,
  total,
  onPage,
}: {
  page: number;
  lastPage: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const t = useTranslations("foods");
  const btn =
    "rounded-full px-4 py-1.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-mkt-mint-bg hover:text-mkt-teal-deep disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between border-t border-divider px-5 py-3">
      <span className="text-sm text-ink-muted">{t("results", { count: total.toLocaleString("en-US") })}</span>
      {lastPage > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            {t("prev")}
          </button>
          <span className="text-xs tabular-nums text-ink-muted">
            {page} / {lastPage}
          </span>
          <button type="button" className={btn} disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
