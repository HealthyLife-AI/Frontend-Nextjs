"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HealthProfileForm } from "@/components/clients/HealthProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HealthProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("clients.healthProfile");
  const tDetail = useTranslations("clients.detail");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/dashboard/patients/${id}`}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-ink-muted shadow-panel transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {tDetail("backToPatient")}
      </Link>

      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="rounded-panel border border-border/70 bg-card p-6 shadow-panel">
        <HealthProfileForm subscriberId={id} />
      </div>
    </div>
  );
}
