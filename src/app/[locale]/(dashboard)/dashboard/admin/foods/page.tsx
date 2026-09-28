"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { FoodForm } from "@/components/foods/FoodForm";
import { FoodTable, Pager } from "@/components/foods/FoodTable";
import { createAdminFood, deleteAdminFood, listAdminFoods, updateAdminFood, type FoodSource } from "@/lib/admin/api";
import type { CatalogFood, FoodPage, FoodStatus } from "@/lib/foods/api";

/**
 * Admin food catalog manager: filter by status/source, search, add
 * (approved immediately), edit any food, delete foods nothing uses yet
 * (the API refuses one referenced by a plan or a client's log).
 */
export default function AdminFoodsPage() {
  const t = useTranslations("admin");
  const tFoods = useTranslations("foods");
  const locale = useLocale();
  const { authorizedFetch } = useAuth();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FoodStatus | "">("");
  const [source, setSource] = useState<FoodSource | "">("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FoodPage | null>(null);
  const [editing, setEditing] = useState<CatalogFood | "new" | null>(null);
  const [deleting, setDeleting] = useState<CatalogFood | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(() => {
    return listAdminFoods(authorizedFetch, { q: query.trim(), status, source, page }).then((r) => {
      if (r.ok) setData(r.data);
    });
  }, [authorizedFetch, query, status, source, page]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const name = (food: CatalogFood) => ((locale === "ar" ? food.name_ar : food.name_en) ?? food.name_en ?? food.name_ar ?? "");

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    const result = await deleteAdminFood(authorizedFetch, deleting.id);
    setDeleteBusy(false);
    if (result.ok) {
      setDeleting(null);
      load();
    } else {
      setDeleteError(result.status === 409 ? t("deleteInUse") : result.error.message);
    }
  }

  const select =
    "h-11 rounded-full border border-border bg-canvas/70 px-4 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("foodsTitle")}
        subtitle={t("foodsSubtitle")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus size={18} strokeWidth={2} />
            {t("addFood")}
          </Button>
        }
      />

      <section className="overflow-hidden rounded-panel border border-border/70 bg-card shadow-panel">
        <div className="flex flex-col gap-3 border-b border-divider p-4 lg:flex-row lg:items-center">
          <label className="relative flex flex-1 items-center">
            <Search size={18} className="pointer-events-none absolute start-4 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full rounded-full border border-border bg-canvas/70 ps-11 pe-4 text-sm text-ink outline-none transition-all placeholder:text-ink-muted hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as FoodStatus | "");
              setPage(1);
            }}
            className={select}
          >
            <option value="">{t("filterAllStatus")}</option>
            {(["approved", "pending", "rejected"] as const).map((s) => (
              <option key={s} value={s}>
                {tFoods(`status.${s}`)}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value as FoodSource | "");
              setPage(1);
            }}
            className={select}
          >
            <option value="">{t("filterAllSources")}</option>
            {(["usda", "admin", "nutritionist"] as const).map((s) => (
              <option key={s} value={s}>
                {tFoods(`source.${s}`)}
              </option>
            ))}
          </select>
        </div>

        {data ? (
          <>
            <FoodTable
              foods={data.data}
              showStatus
              empty={tFoods("noResults")}
              actions={(food) => (
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(food)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-mkt-mint-bg hover:text-mkt-teal-deep"
                    aria-label={t("edit")}
                    title={t("edit")}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleting(food);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-status-late-bg hover:text-status-late"
                    aria-label={t("delete")}
                    title={t("delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
            <Pager page={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} onPage={setPage} />
          </>
        ) : (
          <p className="px-5 py-14 text-center text-sm text-ink-muted">…</p>
        )}
      </section>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? t("addFood") : t("editFood")}
        size="lg"
      >
        {editing !== null && (
          <FoodForm
            key={editing === "new" ? "new" : editing.id}
            food={editing === "new" ? null : editing}
            submitLabel={editing === "new" ? t("create") : t("save")}
            onCancel={() => setEditing(null)}
            onSubmit={async (payload) => {
              const result =
                editing === "new"
                  ? await createAdminFood(authorizedFetch, payload)
                  : await updateAdminFood(authorizedFetch, editing.id, payload);
              if (!result.ok) return { ok: false, error: result.error };
              setEditing(null);
              load();
              return { ok: true };
            }}
          />
        )}
      </Dialog>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)} title={t("deleteTitle")} busy={deleteBusy}>
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink-muted">{t("deleteBody", { name: name(deleting) })}</p>
            {deleteError && (
              <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleting(null)} disabled={deleteBusy}>
                {tFoods("form.cancel")}
              </Button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-status-late px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
