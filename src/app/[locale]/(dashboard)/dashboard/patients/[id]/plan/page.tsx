"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PlanDesigner } from "@/components/mealPlans/PlanDesigner";

export default function PlanDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("planDesigner");
  const tDetail = useTranslations("clients.detail");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        href={`/dashboard/patients/${id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowRight size={16} className="rtl:-scale-x-100" />
        {tDetail("backToPatient")}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <PlanDesigner subscriberId={id} />
    </div>
  );
}
