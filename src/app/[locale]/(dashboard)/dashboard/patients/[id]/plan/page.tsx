"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PlanDesigner } from "@/components/mealPlans/PlanDesigner";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PlanDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Set when arriving from the template library, which creates a new
  // draft and needs THAT plan opened rather than the client's active one.
  const planId = useSearchParams().get("planId") ?? undefined;
  const t = useTranslations("planDesigner");
  const tDetail = useTranslations("clients.detail");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        href={`/dashboard/patients/${id}`}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-ink-muted shadow-panel transition-colors hover:border-primary/30 hover:text-mkt-teal-deep"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {tDetail("backToPatient")}
      </Link>

      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <PlanDesigner subscriberId={id} planId={planId} />
    </div>
  );
}
