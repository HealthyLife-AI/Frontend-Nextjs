"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Search, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { searchFoods } from "@/lib/mealPlans/api";
import type { Food } from "@/lib/clients/types";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/**
 * S3-10 / FR-14: search-as-you-type over the approved food database,
 * used both for adding a planned item and for adding an alternative to
 * one. Debounced client-side (no library — a single `setTimeout` is all
 * this needs) so typing a whole word doesn't fire a request per
 * keystroke against a remote API.
 *
 * Two-step flow, not a single combined form: picking a food and setting
 * its quantity are different decisions (browsing vs. how much), and
 * showing the quantity field only once something is picked keeps the
 * dropdown from competing with a numeric input for the same space.
 */
export function FoodAutocomplete({
  onSelect,
  onCancel,
}: {
  onSelect: (food: Food, quantityGrams: number) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("planDesigner.foodPicker");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("100");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Nothing to clear here: the dropdown below already only renders
    // when the query is long enough, regardless of whatever's sitting
    // in `results` from a previous, longer query — so a short query
    // just skips the fetch, it doesn't need to also reset state.
    if (query.trim().length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    // Necessary setState-in-effect (same justification as PatientsPage's
    // fetch effect): this IS the search, and the loading state has to
    // flip the moment the query changes, not once the debounced fetch
    // resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const timer = setTimeout(async () => {
      const result = await searchFoods(authorizedFetch, query.trim());
      if (cancelled) return;
      setResults(result.ok ? result.data.data : []);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, authorizedFetch]);

  function foodLabel(food: Food): string {
    return (locale === "ar" ? food.name_ar : food.name_en) ?? food.name_en ?? food.name_ar ?? "";
  }

  if (selected) {
    const qty = Number(quantity);
    const validQty = Number.isFinite(qty) && qty > 0;

    return (
      <div className="flex flex-col gap-2 rounded-control border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">{foodLabel(selected)}</span>
          <button type="button" onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="5000"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-9 w-24 rounded-control border border-border bg-card px-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
            autoFocus
          />
          <span className="text-sm text-ink-muted">{t("grams")}</span>
          <Button
            type="button"
            className="!h-9 !px-3 ms-auto"
            disabled={!validQty}
            onClick={() => validQty && onSelect(selected, qty)}
          >
            {t("add")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-control border border-border bg-card p-3 shadow-card">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="h-9 w-full rounded-control border border-border bg-canvas ps-8 pe-3 text-sm text-ink outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          />
        </div>
        <button type="button" onClick={onCancel} className="text-ink-muted hover:text-ink" aria-label={t("cancel")}>
          <X size={18} />
        </button>
      </div>

      {query.trim().length >= MIN_QUERY_LENGTH && (
        <div className="max-h-56 overflow-y-auto rounded-control border border-border">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-3 text-sm text-ink-muted">
              <Loader2 size={14} className="animate-spin" />
              {t("searching")}
            </div>
          )}

          {!loading && results.length === 0 && (
            <p className="p-3 text-center text-sm text-ink-muted">{t("noResults")}</p>
          )}

          {!loading &&
            results.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelected(food)}
                className="flex w-full items-center justify-between border-b border-divider px-3 py-2 text-start text-sm last:border-0 hover:bg-canvas"
              >
                <span className="text-ink">{foodLabel(food)}</span>
                <span className="text-xs text-ink-muted">{t("caloriesPer100g", { value: food.calories_per_100g })}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
