"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pager } from "@/components/foods/FoodTable";
import { listAdminNutritionists, type AdminNutritionistPage } from "@/lib/admin/api";

/** Every nutritionist account on the platform, with client counts. */
export default function AdminNutritionistsPage() {
  const t = useTranslations("admin");
  const format = useFormatter();
  const { authorizedFetch } = useAuth();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminNutritionistPage | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      listAdminNutritionists(authorizedFetch, { q: query.trim(), page }).then((r) => {
        if (!cancelled && r.ok) setData(r.data);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authorizedFetch, query, page]);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow={t("eyebrow")} title={t("nutritionistsTitle")} subtitle={t("nutritionistsSubtitle")} />

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
              placeholder={t("searchNutritionists")}
              className="h-11 w-full rounded-full border border-border bg-canvas/70 ps-11 pe-4 text-sm text-ink outline-none transition-all placeholder:text-ink-muted hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        {!data ? (
          <p className="px-5 py-14 text-center text-sm text-ink-muted">…</p>
        ) : data.data.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-ink-muted">{t("nutritionistsEmpty")}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-mkt-mint-bg/60 text-xs font-bold text-mkt-teal-deep">
                    <th className="px-5 py-3.5 text-start">{t("colName")}</th>
                    <th className="px-3 py-3.5 text-start">{t("colClinic")}</th>
                    <th className="px-3 py-3.5 text-end">{t("colClients")}</th>
                    <th className="px-3 py-3.5 text-end">{t("colActive")}</th>
                    <th className="px-5 py-3.5 text-end">{t("colJoined")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((n) => (
                    <tr key={n.id} className="border-b border-divider last:border-0 hover:bg-mkt-mint-bg/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mkt-mint-bg to-mkt-sky/40 text-sm font-bold text-mkt-teal-deep ring-1 ring-mkt-mint-border/60">
                            {n.name.replace(/^د\.\s*/, "").charAt(0)}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-bold text-ink">{n.name}</span>
                            <span className="truncate text-xs text-ink-muted" dir="ltr">
                              {n.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-muted">{n.clinic_name ?? "—"}</td>
                      <td className="px-3 py-3 text-end font-bold tabular-nums text-ink">{n.clients_count}</td>
                      <td className="px-3 py-3 text-end tabular-nums text-status-on-track">{n.active_clients_count}</td>
                      <td className="px-5 py-3 text-end text-ink-muted">
                        {n.created_at ? format.dateTime(new Date(n.created_at), { dateStyle: "medium", numberingSystem: "latn" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} onPage={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
