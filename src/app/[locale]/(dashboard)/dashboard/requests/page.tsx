"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareMore } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { useOpenRequests } from "@/components/quickRequests/OpenRequestsProvider";
import { QuickRequestCard } from "@/components/quickRequests/QuickRequestCard";
import { listQuickRequests, type QuickRequest } from "@/lib/quickRequests/api";

/**
 * Phase 1, E6: every patient's OPEN request in one list, newest first. An
 * answered or closed one leaves the list at once (and the sidebar count
 * drops); its history stays on the patient's profile.
 */
export default function RequestsPage() {
  const t = useTranslations("quickRequests");
  const { authorizedFetch } = useAuth();
  const { refresh } = useOpenRequests();

  const [requests, setRequests] = useState<QuickRequest[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const r = await listQuickRequests(authorizedFetch, "open");
    if (r.ok) setRequests(r.data.data);
    else setFailed(true);
  }, [authorizedFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {requests === null && !failed && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {requests?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-border/70 bg-card py-16 text-center shadow-panel">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquareMore size={22} strokeWidth={1.75} />
          </div>
          <p className="max-w-xs text-sm text-ink-muted">{t("empty")}</p>
        </div>
      )}

      {requests?.map((request) => (
        <QuickRequestCard
          key={request.id}
          request={request}
          showPatient
          onChanged={() => {
            // Answered or closed: it is no longer open, so it leaves this list.
            setRequests((list) => list?.filter((x) => x.id !== request.id) ?? null);
            refresh();
          }}
        />
      ))}
    </div>
  );
}
