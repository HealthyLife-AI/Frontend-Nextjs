"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareMore } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listClientQuickRequests, type QuickRequest } from "@/lib/quickRequests/api";
import { useOpenRequests } from "./OpenRequestsProvider";
import { QuickRequestCard } from "./QuickRequestCard";

/**
 * Phase 1, E6: this patient's request history on their profile, newest
 * first, with the reply box on the ones still open. Hidden entirely until the
 * patient has sent one, so a patient who never asks sees no empty section.
 */
export function PatientRequestsCard({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("quickRequests");
  const { authorizedFetch } = useAuth();
  const { refresh } = useOpenRequests();
  const [requests, setRequests] = useState<QuickRequest[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listClientQuickRequests(authorizedFetch, subscriberId).then((r) => {
      if (!cancelled && r.ok) setRequests(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  if (!requests || requests.length === 0) return null;

  return (
    <section id="requests" className="flex scroll-mt-24 flex-col gap-3 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
      <div className="flex items-start gap-2">
        <MessageSquareMore size={18} className="mt-0.5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">{t("patientTitle")}</h2>
          <p className="text-sm text-ink-muted">{t("patientHelper")}</p>
        </div>
      </div>

      {requests.map((request) => (
        <QuickRequestCard
          key={request.id}
          request={request}
          showPatient={false}
          readOnly={readOnly}
          onChanged={(next) => {
            setRequests((list) => list?.map((x) => (x.id === next.id ? next : x)) ?? null);
            refresh();
          }}
        />
      ))}
    </section>
  );
}
