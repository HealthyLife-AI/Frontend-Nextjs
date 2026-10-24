"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, HeartOff, Search, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFoodPreferences, saveFoodPreferences, type FoodPreferences, type PreferredFood } from "@/lib/foodPreferences/api";
import type { Food } from "@/lib/clients/types";
import { searchFoods } from "@/lib/mealPlans/api";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

const label = (f: { name_ar: string | null; name_en: string | null }, locale: string) =>
  (locale === "ar" ? f.name_ar ?? f.name_en : f.name_en ?? f.name_ar) ?? "";

/**
 * Phase 2, B6: the foods this patient likes and dislikes. Soft preferences
 * only: they mark foods in the plan designer and lean the AI draft, but never
 * block a food and never replace an allergy. Two chip lists, a food search to
 * add to either, and who added each (المريض / الأخصائية).
 *
 * The nutritionist's list is the WHOLE list: removing a chip removes it, the
 * patient's own included.
 */
export function FoodPreferencesCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("foodPreferences");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [prefs, setPrefs] = useState<FoodPreferences | null>(null);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFoodPreferences(authorizedFetch, subscriberId).then((r) => {
      if (cancelled) return;
      if (r.ok) setPrefs(r.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearching(true);

    const timer = setTimeout(async () => {
      const r = await searchFoods(authorizedFetch, query.trim());
      if (cancelled) return;
      setResults(r.ok ? r.data.data : []);
      setSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, authorizedFetch]);

  if (failed) return <p className="text-sm text-danger">{t("loadFailed")}</p>;
  if (!prefs) return null;

  async function write(likes: number[], dislikes: number[]) {
    setBusy(true);
    setError(null);
    const r = await saveFoodPreferences(authorizedFetch, subscriberId, { likes, dislikes });
    setBusy(false);

    if (!r.ok) {
      setError(r.error.errors ? Object.values(r.error.errors)[0]?.[0] ?? t("saveFailed") : t("saveFailed"));
      return;
    }

    setPrefs(r.data);
  }

  const ids = (list: PreferredFood[]) => list.map((p) => p.food_id);

  function add(food: Food, kind: "like" | "dislike") {
    if (!prefs) return;
    // A food is in one list only: adding it to one takes it out of the other.
    const likes = ids(prefs.likes).filter((id) => id !== food.id);
    const dislikes = ids(prefs.dislikes).filter((id) => id !== food.id);
    (kind === "like" ? likes : dislikes).push(food.id);
    void write(likes, dislikes);
  }

  function remove(foodId: number) {
    if (!prefs) return;
    void write(ids(prefs.likes).filter((id) => id !== foodId), ids(prefs.dislikes).filter((id) => id !== foodId));
  }

  const chips = (list: PreferredFood[], tone: "like" | "dislike") => (
    <ul className="flex flex-wrap gap-2">
      {list.length === 0 && <li className="text-sm text-ink-muted">{t(tone === "like" ? "noLikes" : "noDislikes")}</li>}
      {list.map((p) => (
        <li
          key={p.food_id}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
            tone === "like" ? "border-status-on-track/30 bg-status-on-track-bg text-ink" : "border-border bg-canvas text-ink-muted"
          }`}
        >
          {label(p, locale)}
          <span className="rounded-full bg-card px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">{t(p.source === "patient" ? "byPatient" : "byNutritionist")}</span>
          {!readOnly && (
            <button type="button" disabled={busy} onClick={() => remove(p.food_id)} aria-label={t("remove", { name: label(p, locale) })} className="text-ink-muted hover:text-danger">
              <X size={14} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <Heart size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-muted">{t("helper")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Heart size={14} className="text-status-on-track" aria-hidden="true" />
          {t("likes")}
        </h3>
        {chips(prefs.likes, "like")}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <HeartOff size={14} className="text-ink-muted" aria-hidden="true" />
          {t("dislikes")}
        </h3>
        {chips(prefs.dislikes, "dislike")}
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-2 border-t border-divider pt-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-11 w-full rounded-field border border-border bg-canvas/60 ps-9 pe-3 text-sm text-ink outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {query.trim().length >= MIN_QUERY && (
            <ul className="max-h-64 overflow-y-auto rounded-field border border-border bg-card">
              {searching && <li className="p-3 text-center text-sm text-ink-muted">{t("searching")}</li>}
              {!searching && results.length === 0 && <li className="p-3 text-center text-sm text-ink-muted">{t("noResults")}</li>}
              {!searching &&
                results.map((food) => (
                  <li key={food.id} className="flex items-center justify-between gap-2 border-b border-divider px-3 py-2 last:border-0">
                    <span className="min-w-0 truncate text-sm text-ink">{label(food, locale)}</span>
                    <span className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => add(food, "like")}
                        className="inline-flex items-center gap-1 rounded-full border border-status-on-track/30 px-2.5 py-1 text-xs font-semibold text-status-on-track hover:bg-status-on-track-bg"
                      >
                        <Heart size={12} aria-hidden="true" />
                        {t("addLike")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => add(food, "dislike")}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-muted hover:bg-canvas"
                      >
                        <HeartOff size={12} aria-hidden="true" />
                        {t("addDislike")}
                      </button>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {error}
        </p>
      )}

      <p className="text-xs text-ink-muted">{t("softNote")}</p>
    </section>
  );
}
