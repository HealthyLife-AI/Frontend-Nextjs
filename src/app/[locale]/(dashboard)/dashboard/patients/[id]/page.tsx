"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { AdherenceBadge } from "@/components/clients/AdherenceBadge";
import { getClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

/**
 * Minimal client summary — enough to host the "View" action from the
 * patient list (S2-10) and the entry point into the health-profile form
 * (S2-12). The full "Client Profile & Progress" screen (adherence
 * charts, weight trend, AI summary — PRD's F-3/F-6/F-7) is a distinct,
 * not-yet-tasked Sprint 3 screen; this page doesn't attempt it.
 */
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("clients.detail");
  const tGoals = useTranslations("goals");
  const { authorizedFetch } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getClient(authorizedFetch, id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setClient(result.data);
      } else {
        setNotFound(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, id]);

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">404</p>
        <Link href="/dashboard/patients" className="text-sm font-medium text-primary hover:underline">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (!client) {
    return <div className="py-16 text-center text-sm text-ink-muted">…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Link
        href="/dashboard/patients"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {t("backToList")}
      </Link>

      <div className="rounded-card border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">{client.name}</h1>
            <p className="text-sm text-ink-muted">{client.code}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-muted">{t("phoneLabel")}</dt>
            <dd className="mt-1 text-ink" dir="ltr">
              {client.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("goalLabel")}</dt>
            <dd className="mt-1 text-ink">{tGoals(client.goal)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("statusLabel")}</dt>
            <dd className="mt-1">
              <ClientStatusBadge status={client.status} />
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("adherenceLabel")}</dt>
            <dd className="mt-1">
              <AdherenceBadge status={client.adherence_status} />
            </dd>
          </div>
        </dl>
      </div>

      <Link href={`/dashboard/patients/${client.id}/health-profile`}>
        <Button variant="secondary" className="w-full">
          <FileText size={18} strokeWidth={1.75} />
          {t("healthProfileLink")}
        </Button>
      </Link>
    </div>
  );
}
