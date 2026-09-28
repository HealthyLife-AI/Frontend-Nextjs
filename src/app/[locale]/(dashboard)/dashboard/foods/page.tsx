"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { FoodForm } from "@/components/foods/FoodForm";
import { FoodTable, Pager } from "@/components/foods/FoodTable";
import { listMyFoods, searchCatalog, submitFood, type FoodPage } from "@/lib/foods/api";

/**
 * Nutritionist's view of the food catalog: search the approved database
 * (USDA + curated Arabic foods + approved submissions), and submit local
 * foods. A submission is pending until an admin approves it (BR-5) —
 * meal plans and client logs only accept approved foods — so "my added
 * foods" shows each one's review status.
 */
export default function FoodsPage() {
  const t = useTranslations("foods");
  const { authorizedFetch } = useAuth();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<FoodPage | null>(null);
  const [mine, setMine] = useState<FoodPage | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState(false);

  const term = query.trim();

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchCatalog(authorizedFetch, term, page).then((r) => {
        if (!cancelled && r.ok) setResults(r.data);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authorizedFetch, term, page]);

  const loadMine = useCallback(() => {
    listMyFoods(authorizedFetch).then((r) => {
      if (r.ok) setMine(r.data);
    });
  }, [authorizedFetch]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus size={18} strokeWidth={2} />
            {t("addButton")}
          </Button>
        }
      />

      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-field bg-status-on-track-bg px-4 py-3 text-sm font-semibold text-status-on-track">
          <CheckCircle2 size={18} />
          {t("submitted")}
        </p>
      )}

      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <div className="border-b border-divider p-4">
          <label className="relative flex items-center">
            <Search size={18} className="pointer-events-none absolute start-4 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-full border border-border bg-canvas/70 ps-11 pe-4 text-sm text-ink outline-none transition-all placeholder:text-ink-muted hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        {term.length < 2 ? (
          <p className="px-5 py-14 text-center text-sm text-ink-muted">{t("searchHint")}</p>
        ) : results ? (
          <>
            <FoodTable foods={results.data} empty={t("noResults")} />
            <Pager page={results.meta.current_page} lastPage={results.meta.last_page} total={results.meta.total} onPage={setPage} />
          </>
        ) : (
          <p className="px-5 py-14 text-center text-sm text-ink-muted">…</p>
        )}
      </section>

      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <h2 className="border-b border-divider px-5 py-4 text-base font-bold text-ink">{t("mySubmissions")}</h2>
        {mine ? (
          <FoodTable foods={mine.data} showStatus showSource={false} empty={t("mySubmissionsEmpty")} />
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">…</p>
        )}
      </section>

      <Dialog open={adding} onClose={() => setAdding(false)} title={t("addTitle")} size="lg">
        <p className="mb-4 rounded-field bg-mkt-mint-bg px-4 py-3 text-sm text-mkt-teal-deep">{t("addNote")}</p>
        <FoodForm
          submitLabel={t("submit")}
          onCancel={() => setAdding(false)}
          onSubmit={async (payload) => {
            const result = await submitFood(authorizedFetch, payload);
            if (!result.ok) return { ok: false, error: result.error };
            setAdding(false);
            setNotice(true);
            loadMine();
            return { ok: true };
          }}
        />
      </Dialog>
    </div>
  );
}
